import { KanbanColumnSkeleton, ProjectCardSkeleton } from "@/components";
import { KanbanAddCardButton } from "@/components/tasks/Kanban/add-card-button";
import {
  KanbanBoard,
  KanbanBoardContainer,
} from "@/components/tasks/Kanban/board";
import { ProjectCardMemo } from "@/components/tasks/Kanban/card";
import KanbanColumn from "@/components/tasks/Kanban/column";
import KanbanItem from "@/components/tasks/Kanban/item";
import {
  UPDATE_TASK_MUTATION,
  UPDATE_TASK_STAGE_MUTATION,
} from "@/graphql/mutations";
import { TASKS_QUERY, TASK_STAGES_QUERY } from "@/graphql/queries";
import { Task } from "@/graphql/schema.types";
import { TaskStagesQuery, TasksQuery } from "@/graphql/types";
import { DragEndEvent } from "@dnd-kit/core";
import { useList, useNavigation, useUpdate } from "@refinedev/core";
import { GetFieldsFromList } from "@refinedev/nestjs-query";
import React, { PropsWithChildren, useMemo } from "react";

type TaskStage = GetFieldsFromList<TaskStagesQuery> & { tasks: Task[] };

const List = ({ children }: PropsWithChildren) => {
  const { replace } = useNavigation();
  const { data: stages, isLoading: isLoadingStages } = useList<TaskStage>({
    resource: "taskStages",
    filters: [
      {
        field: "title",
        operator: "in",
        value: ["TODO", "IN PROGRESS", "IN REVIEW", "DONE"],
      },
    ],
    sorters: [
      {
        field: "createdAt",
        order: "asc",
      },
    ],
    meta: {
      gqlQuery: TASK_STAGES_QUERY,
    },
  });

  const { mutate: updateTask } = useUpdate();

  const { data: tasks, isLoading: isLoadingTask } = useList<
    GetFieldsFromList<TasksQuery>
  >({
    resource: "tasks",
    sorters: [
      {
        field: "dueDate",
        order: "asc",
      },
    ],
    queryOptions: {
      enabled: !!stages,
    },
    pagination: {
      mode: "off",
    },
    meta: {
      gqlQuery: TASKS_QUERY,
    },
  });

  const taskStages = useMemo(() => {
    if (!tasks?.data || !stages?.data) {
      return {
        unassignedStages: [],
        stages: [],
      };
    }

    const unassignedStages = tasks.data.filter((task) => task.stageId === null);
    //@ts-ignore
    const grouped: TaskStage[] = stages.data.map((stage) => ({
      ...stage,
      tasks: tasks.data.filter((task) => task.stageId?.toString() === stage.id),
    }));

    return {
      unassignedStages,
      columns: grouped,
    };
  }, [stages, tasks]);

  const handleAddCard = (args: { stageId: string }) => {
    const path =
      args.stageId === "unassigned"
        ? "/tasks/new"
        : `/tasks/new?stageId=${args.stageId}`;
    replace(path);
  };

  const handleOnDragEnd = (event: DragEndEvent) => {
    let stageId = event.over?.id as undefined | string | null;
    const taskId = event.active.id as string;
    const taskStageId = event.active.data.current?.stageId;

    if (stageId === "unassigned") {
      stageId = null;
    }

    updateTask({
      resource: "tasks",
      id: taskId,
      values: {
        stageId: stageId,
      },
      successNotification: false,
      mutationMode: "optimistic",
      meta: {
        gqlMutation: UPDATE_TASK_STAGE_MUTATION,
      },
    });
  };

  const isLoading = isLoadingStages || isLoadingTask;

  if (isLoading) return <PageSkeleton />;

  return (
    <>
      <KanbanBoardContainer>
        <KanbanBoard onDragEnd={handleOnDragEnd}>
          <KanbanColumn
            id='unassigned'
            title={"unassigned"}
            count={taskStages.unassignedStages.length || 0}
            onAddClick={() => handleAddCard({ stageId: "unassigned" })}>
            {taskStages.unassignedStages.map((task) => (
              <KanbanItem
                key={task.id}
                id={task.id}
                data={{ ...task, stageId: "unassigned" }}>
                <ProjectCardMemo
                  {...task}
                  dueDate={task.dueDate || undefined}
                />
              </KanbanItem>
            ))}
            {!taskStages.unassignedStages.length && (
              <KanbanAddCardButton
                onClick={() => handleAddCard({ stageId: "unassigned" })}
              />
            )}
          </KanbanColumn>
          {taskStages.columns?.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              count={column.tasks.length}
              onAddClick={() => handleAddCard({ stageId: column.id })}>
              {!isLoading &&
                column.tasks.map((task) => (
                  <KanbanItem key={task.id} id={task.id} data={task}>
                    <ProjectCardMemo
                      {...task}
                      dueDate={task.dueDate || undefined}
                    />
                  </KanbanItem>
                ))}
              {!column.tasks.length && (
                <KanbanAddCardButton
                  onClick={() => handleAddCard({ stageId: column.id })}
                />
              )}
            </KanbanColumn>
          ))}
        </KanbanBoard>
      </KanbanBoardContainer>
      {children}
    </>
  );
};

export default List;

const PageSkeleton = () => {
  const coulmnCount = 6;
  const itemCount = 4;

  return (
    <KanbanBoardContainer>
      {Array.from({ length: coulmnCount }).map((_, index) => (
        <KanbanColumnSkeleton key={index}>
          {Array.from({ length: itemCount }).map((_, index) => (
            <ProjectCardSkeleton key={index} />
          ))}
        </KanbanColumnSkeleton>
      ))}
    </KanbanBoardContainer>
  );
};
