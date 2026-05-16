import React, { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';
import { useNavigate, useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
    getInterviewFlow,
    getCandidatesByPosition,
    updateCandidateStage,
} from '../services/positionService';

type InterviewStep = {
    id: number;
    name: string;
    orderIndex: number;
};

type Candidate = {
    fullName: string;
    currentInterviewStep: string;
    averageScore: number;
    candidateId?: number;
    applicationId?: number;
};

const ScoreDots: React.FC<{ score: number; max?: number }> = ({ score, max = 5 }) => {
    const filled = Math.max(0, Math.min(max, Math.round(score)));
    return (
        <div className="d-flex gap-1 mt-2" aria-label={`Puntuación: ${filled} de ${max}`}>
            {Array.from({ length: max }).map((_, i) => (
                <span
                    key={i}
                    style={{
                        display: 'inline-block',
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: i < filled ? '#22c55e' : '#e5e7eb',
                    }}
                />
            ))}
        </div>
    );
};

const PositionDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [positionName, setPositionName] = useState<string>('');
    const [steps, setSteps] = useState<InterviewStep[]>([]);
    const [candidatesByStep, setCandidatesByStep] = useState<Record<string, Candidate[]>>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const stepIdByName = useMemo(() => {
        const map: Record<string, number> = {};
        steps.forEach(s => { map[s.name] = s.id; });
        return map;
    }, [steps]);

    useEffect(() => {
        if (!id) return;
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const [flowResp, candidates] = await Promise.all([
                    getInterviewFlow(id),
                    getCandidatesByPosition(id),
                ]);
                if (cancelled) return;

                const flowSteps: InterviewStep[] = (flowResp?.interviewFlow?.interviewSteps ?? [])
                    .slice()
                    .sort((a: InterviewStep, b: InterviewStep) => a.orderIndex - b.orderIndex);

                setPositionName(flowResp?.positionName ?? '');
                setSteps(flowSteps);

                const grouped: Record<string, Candidate[]> = {};
                flowSteps.forEach(s => { grouped[s.name] = []; });
                (candidates as Candidate[]).forEach(c => {
                    const key = c.currentInterviewStep;
                    if (!grouped[key]) grouped[key] = [];
                    grouped[key].push(c);
                });
                setCandidatesByStep(grouped);
            } catch (e: any) {
                if (!cancelled) setError(e?.message ?? 'Error cargando la posición');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [id]);

    const onDragEnd = async (result: DropResult) => {
        const { source, destination } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const sourceList = Array.from(candidatesByStep[source.droppableId] ?? []);
        const destList = source.droppableId === destination.droppableId
            ? sourceList
            : Array.from(candidatesByStep[destination.droppableId] ?? []);

        const [moved] = sourceList.splice(source.index, 1);
        if (!moved) return;
        const updatedCandidate: Candidate = { ...moved, currentInterviewStep: destination.droppableId };
        destList.splice(destination.index, 0, updatedCandidate);

        const previous = candidatesByStep;
        const next: Record<string, Candidate[]> = { ...candidatesByStep };
        next[source.droppableId] = sourceList;
        if (source.droppableId !== destination.droppableId) {
            next[destination.droppableId] = destList;
        }
        setCandidatesByStep(next);

        const newStepId = stepIdByName[destination.droppableId];
        const { candidateId, applicationId } = updatedCandidate;
        const isPositiveInt = (n: unknown): n is number =>
            typeof n === 'number' && Number.isInteger(n) && n > 0;

        if (!isPositiveInt(newStepId) || !isPositiveInt(candidateId) || !isPositiveInt(applicationId)) {
            setCandidatesByStep(previous);
            console.error('Aborting stage update: missing candidateId/applicationId/stepId', {
                candidateId, applicationId, newStepId, candidate: updatedCandidate,
            });
            setError('No se pudo actualizar la fase: el candidato no tiene identificadores válidos.');
            return;
        }

        try {
            await updateCandidateStage(candidateId, applicationId, newStepId);
        } catch (e) {
            setCandidatesByStep(previous);
            setError('No se pudo actualizar la fase del candidato. Se ha revertido el cambio.');
        }
    };

    if (loading) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" role="status" />
            </Container>
        );
    }

    return (
        <Container fluid className="py-4 px-3 px-md-5">
            <div className="d-flex align-items-center mb-4">
                <Button
                    variant="link"
                    className="p-0 me-3 text-dark"
                    onClick={() => navigate('/positions')}
                    aria-label="Volver al listado de posiciones"
                >
                    <ArrowLeft size={28} />
                </Button>
                <h2 className="m-0 fw-bold">{positionName}</h2>
            </div>

            {error && <Alert variant="warning" onClose={() => setError(null)} dismissible>{error}</Alert>}

            <DragDropContext onDragEnd={onDragEnd}>
                <Row className="g-3 flex-nowrap flex-md-nowrap overflow-auto kanban-row">
                    {steps.map(step => {
                        const items = candidatesByStep[step.name] ?? [];
                        return (
                            <Col
                                key={step.id}
                                xs={12}
                                md={Math.max(2, Math.floor(12 / Math.max(steps.length, 1)))}
                                className="kanban-col"
                            >
                                <div
                                    className="rounded-3 p-3 h-100"
                                    style={{ backgroundColor: '#f1f3f5', minHeight: 300 }}
                                >
                                    <h6 className="fw-semibold mb-3">{step.name}</h6>
                                    <Droppable droppableId={step.name}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className="d-flex flex-column gap-2"
                                                style={{
                                                    minHeight: 200,
                                                    backgroundColor: snapshot.isDraggingOver ? '#e9ecef' : 'transparent',
                                                    borderRadius: 8,
                                                    transition: 'background-color 120ms ease',
                                                }}
                                            >
                                                {items.map((c, index) => {
                                                    const cid = c.candidateId ?? index;
                                                    const aid = c.applicationId ?? index;
                                                    const draggableId = `${cid}:${aid}:${step.id}:${index}`;
                                                    return (
                                                        <Draggable key={draggableId} draggableId={draggableId} index={index}>
                                                            {(dragProvided, dragSnapshot) => (
                                                                <Card
                                                                    ref={dragProvided.innerRef}
                                                                    {...dragProvided.draggableProps}
                                                                    {...dragProvided.dragHandleProps}
                                                                    className="border-0 shadow-sm"
                                                                    style={{
                                                                        ...dragProvided.draggableProps.style,
                                                                        opacity: dragSnapshot.isDragging ? 0.9 : 1,
                                                                    }}
                                                                >
                                                                    <Card.Body className="py-2 px-3">
                                                                        <div className="fw-semibold">{c.fullName}</div>
                                                                        <ScoreDots score={c.averageScore ?? 0} />
                                                                    </Card.Body>
                                                                </Card>
                                                            )}
                                                        </Draggable>
                                                    );
                                                })}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            </Col>
                        );
                    })}
                </Row>
            </DragDropContext>

            <style>{`
                @media (max-width: 767.98px) {
                    .kanban-row { flex-wrap: wrap !important; overflow-x: visible !important; }
                    .kanban-col { width: 100% !important; flex: 0 0 100% !important; max-width: 100% !important; }
                }
                @media (min-width: 768px) {
                    .kanban-row { overflow-x: auto; }
                    .kanban-col { min-width: 240px; }
                }
            `}</style>
        </Container>
    );
};

export default PositionDetail;
