export class BrandLimitedDTO {
  brandId: string;
  brandName: string;

  constructor(brand: any) {
    this.brandId = brand.brandId;
    this.brandName = brand.brandName;
  }

  static fromEntity(brand: any): BrandLimitedDTO {
    return new BrandLimitedDTO(brand);
  }
}
