import { Injectable, Scope } from "@nestjs/common";

@Injectable({ scope: Scope.REQUEST })
export class AuthContextRequest {
  private authData: {
    id: number,
    company: string
  }

  setAuthData(data: {
    id: number, company: string
  }): void {
    this.authData = {
      id: data.id,
      company: data.company
    }
  }

  getAuthId(): number {
    return this.authData.id;
  }

  getAuthCompany(): string {
    return this.authData.company
  }
}