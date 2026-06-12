import { Type } from "class-transformer";
import { IsArray, ValidateNested } from "class-validator";
import { OrganizationChartNodeUpdateRequest } from "./organization-chart-node-update.request";

export class OrganizationChartUpdateRequest {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrganizationChartNodeUpdateRequest)
  nodes: OrganizationChartNodeUpdateRequest[];
}
