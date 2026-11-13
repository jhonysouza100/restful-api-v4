import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class AutenticationContext {
  private adminData: {
    id: number;
  };

  setAdminData(data: { id: number; }): void {
    this.adminData = {
      id: data.id,
    };
  }

  getAdminId(): number {
    return this.adminData.id;
  }
}
