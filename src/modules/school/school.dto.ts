import { t } from 'elysia';

export const CreateSchoolYearSchema = t.Object({
  start: t.String(),
  end: t.String(),
  midterm: t.String(),
  current: t.Optional(t.Boolean()),
});

export const UpdateSchoolYearSchema = t.Object({
  start: t.Optional(t.String()),
  end: t.Optional(t.String()),
  midterm: t.Optional(t.String()),
  current: t.Optional(t.Boolean()),
});

export const CreateBuildingSchema = t.Object({
  name: t.String({ minLength: 1 }),
  address: t.Optional(t.String()),
  color: t.Optional(t.String()),
  floorsCount: t.Optional(t.Number()),
});

export const CreateFloorSchema = t.Object({
  building_id: t.Number(),
  floor_number: t.Number(),
  name: t.Optional(t.String()),
});

export const CreateRoomSchema = t.Object({
  floor_id: t.Number(),
  name: t.String({ minLength: 1 }),
  type: t.Optional(t.String()),
  capacity: t.Optional(t.Number()),
});

export const CreateHallwaySchema = t.Object({
  floor_id: t.Number(),
  name: t.String({ minLength: 1 }),
});

export const CreateInventorySchema = t.Object({
  name: t.String({ minLength: 1 }),
  room_id: t.Optional(t.Number()),
  code: t.Optional(t.String()),
  description: t.Optional(t.String()),
  quantity: t.Optional(t.Number()),
});
