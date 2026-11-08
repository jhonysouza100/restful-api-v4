import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class AdminContext {
  private authData: {
    id: number;
  };

  setAuthData(data: { id: number; }): void {
    this.authData = {
      id: data.id,
    };
  }

  getAuthId(): number {
    return this.authData.id;
  }
}
