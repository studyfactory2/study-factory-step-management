import { Position } from "../entity/position.entity";

export class PositionResponse {
  id: number;
  code: string;
  name: string;
  subtitle: string | null;
  parentId: number | null;
  displayOrder: number;
  isLoginVisible: boolean;
  isAdmin: boolean;
  isActive: boolean;

  static from(position: Position): PositionResponse {
    return {
      id: position.id,
      code: position.code,
      name: position.name,
      subtitle: position.subtitle,
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
