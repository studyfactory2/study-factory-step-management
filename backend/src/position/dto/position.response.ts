import { Position } from "../entity/position.entity";

export class PositionResponse {
  id: number;
  name: string;
  subtitle: string | null;
  duties: string[];
  dutyOptions: {
    id: number;
    name: string;
  }[];
  parentId: number | null;
  displayOrder: number;
  isLoginVisible: boolean;
  isAdmin: boolean;
  isActive: boolean;

  static from(position: Position): PositionResponse {
    return {
      id: position.id,
      name: position.name,
      subtitle: position.subtitle,
      duties: position.dutyLinks?.map((dutyLink) => dutyLink.name ?? dutyLink.duty ?? "").filter(Boolean) ?? [],
      dutyOptions: position.dutyLinks?.map((dutyLink) => ({
        id: dutyLink.id,
        name: dutyLink.name ?? dutyLink.duty ?? "역할 미지정"
      })) ?? [],
      parentId: position.parentId,
      displayOrder: position.displayOrder,
      isLoginVisible: position.isLoginVisible,
      isAdmin: position.isAdmin,
      isActive: position.isActive
    };
  }
}

export class PositionTreeResponse extends PositionResponse {
  children: PositionTreeResponse[];

  static fromPosition(position: Position): PositionTreeResponse {
    return {
      ...PositionResponse.from(position),
      children: []
    };
  }
}
