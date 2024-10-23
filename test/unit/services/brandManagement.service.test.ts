import { Brand } from "../../../src/entities/Brand/brandEntity";
import { User } from "../../../src/entities/user/userEntity";
import { ContactPerson } from "../../../src/entities/ContactPerson/contactPersonEntity";
import APIError from "../../../src/middleware/errorMiddlware";
import { ErrorCommonStrings } from "../../../src/utils/constant";
import { HttpStatusCode } from "../../../src/middleware/errorMiddlware";
import { BrandDTO } from "../../../src/dtos/brandDto";
import { BrandLimitedDTO } from "../../../src/dtos/brandLimiteddto";
import { BrandManagementService } from "../../../src/services/v1/brandMangment.service";

jest.mock("../../../src/entities/Brand/brandEntity");
jest.mock("../../../src/entities/user/userEntity");

describe("BrandManagementService", () => {
  let service: BrandManagementService;
  let mockBrandRepo: any;
  let mockContactPersonRepo: any;
  let mockUserRepo: any;

  beforeEach(() => {
    mockBrandRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    };
    mockContactPersonRepo = {
      create: jest.fn(),
      save: jest.fn(),
    };
    mockUserRepo = {
      findOne: jest.fn(),
    };

    service = new BrandManagementService();
    service["brandRepo"] = mockBrandRepo;
    service["contactPersonRepo"] = mockContactPersonRepo;
  });

  describe("updateBrand", () => {
    const brandId = "e25cf07e-81fe-4ff6-96cc-eeb0480665a4";
    const updatedData = {
      brandName: "New Brand",
      revenue: 100000,
      dealCloseValue: 50000,
    };

    it("should update brand details if the brand exists", async () => {
      const mockBrand = { brandId, save: jest.fn() };
      mockBrandRepo.findOne.mockResolvedValue(mockBrand);

      const result = await service.updateBrand(
        brandId,
        updatedData.brandName,
        updatedData.revenue,
        updatedData.dealCloseValue
      );

      expect(mockBrandRepo.findOne).toHaveBeenCalledWith({
        where: { brandId },
      });
      expect(mockBrand.save).toHaveBeenCalled();
      expect(result).toEqual(mockBrand);
    });

    it("should throw an error if the brand is not found", async () => {
      mockBrandRepo.findOne.mockResolvedValue(null);

      await expect(
        service.updateBrand(
          brandId,
          updatedData.brandName,
          updatedData.revenue,
          updatedData.dealCloseValue
        )
      ).rejects.toThrow(APIError);
    });
  });

  describe("getBrands", () => {
    const userId = "user123";
    it("should return brands if user exists", async () => {
      const userMock = { userId, ownerBrands: [{ brandId: "brand123" }] };
      mockUserRepo.findOne.mockResolvedValue(userMock);

      const result = await service.getBrands(userId);

      expect(mockUserRepo.findOne).toHaveBeenCalledWith({
        where: { userId },
        relations: ["ownerBrands"],
      });
      expect(result).toEqual(userMock.ownerBrands);
    });

    it("should throw an error if the user is not found", async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.getBrands(userId)).rejects.toThrow(APIError);
    });
  });

  describe("getFullBrandDetails", () => {
    const brandId = "brand123";
    const mockBrand = {
      brandId,
      contactPersons: [],
      owners: [],
    };

    it("should return full brand details if the brand exists", async () => {
      mockBrandRepo.findOne.mockResolvedValue(mockBrand);
      const brandDTO = BrandDTO.fromEntity(mockBrand);

      const result = await service.getFullBrandDetails(brandId);

      expect(mockBrandRepo.findOne).toHaveBeenCalledWith({
        where: { brandId },
        relations: ["contactPersons", "owners"],
      });
      expect(result).toEqual(brandDTO);
    });

    it("should throw an error if the brand is not found", async () => {
      mockBrandRepo.findOne.mockResolvedValue(null);

      await expect(service.getFullBrandDetails(brandId)).rejects.toThrow(
        APIError
      );
    });
  });

  describe("getLimitedBrandDetails", () => {
    const brandId = "brand123";
    const mockBrand = { brandId, brandName: "BrandName" };

    it("should return limited brand details", async () => {
      mockBrandRepo.findOne.mockResolvedValue(mockBrand);
      const brandLimitedDTO = BrandLimitedDTO.fromEntity(mockBrand);

      const result = await service.getLimitedBrandDetails(brandId);

      expect(mockBrandRepo.findOne).toHaveBeenCalledWith({
        where: { brandId },
        select: ["brandId", "brandName"],
      });
      expect(result).toEqual(brandLimitedDTO);
    });

    it("should throw an error if the brand is not found", async () => {
      mockBrandRepo.findOne.mockResolvedValue(null);

      await expect(service.getLimitedBrandDetails(brandId)).rejects.toThrow(
        APIError
      );
    });
  });

  describe("updateContactPerson", () => {
    const brandId = "brand123";
    const contactId = "contact123";
    const updateData = { name: "John Doe" };
    const mockContactPerson = {
      contactId,
      brand: { brandId },
      save: jest.fn(),
    };

    it("should update the contact person details", async () => {
      mockContactPersonRepo.findOne.mockResolvedValue(mockContactPerson);

      const result = await service.updateContactPerson(
        brandId,
        contactId,
        updateData
      );

      expect(mockContactPersonRepo.findOne).toHaveBeenCalledWith({
        where: { contactId, brand: { brandId } },
        relations: ["brand"],
      });
      expect(mockContactPerson.save).toHaveBeenCalled();
      expect(result).toEqual(expect.any(Object));
    });

    it("should throw an error if contact person is not found", async () => {
      mockContactPersonRepo.findOne.mockResolvedValue(null);

      await expect(
        service.updateContactPerson(brandId, contactId, updateData)
      ).rejects.toThrow(APIError);
    });
  });
});
