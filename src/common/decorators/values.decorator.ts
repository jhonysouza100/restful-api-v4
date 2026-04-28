import { applyDecorators, UseGuards } from "@nestjs/common";
import { HasValuesGuard } from "../guards/values.guard";

export function HasValues() {
  return applyDecorators(
    UseGuards(HasValuesGuard)
  )
}