import { injectable } from "tsyringe";

@injectable()
export class ReferralCodeService {
  generate(refId?: string): string {
    const objectIdPart = refId?.substring(0, 8) ?? this.generateObjectIdPrefix();
    const base36Id = parseInt(objectIdPart, 16).toString(36).toUpperCase();
    return `SRT-${base36Id}`;
  }

  private generateObjectIdPrefix(): string {
   
    const random = Math.floor(Math.random() * 0xffffffff);
    return random.toString(16).padStart(8, "0");
  }
}
