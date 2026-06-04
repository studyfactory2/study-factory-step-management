import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHealth() {
    return {
      name: "study-factory-step-management",
      message: "자격증공장 사원업무현황 API가 실행 중입니다.",
    };
  }
}
