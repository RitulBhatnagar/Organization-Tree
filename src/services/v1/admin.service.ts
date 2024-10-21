import * as argon2 from "argon2";
import { User } from "../../entities/user/userEntity";
import { Role } from "../../entities/Role/roleEntity";
import { Team } from "../../entities/Team/teamEntity";
import { Brand } from "../../entities/Brand/brandEntity";
import logger from "../../utils/logger";
import { AppDataSource } from "../../config/data-source";
import APIError, { HttpStatusCode } from "../../middleware/errorMiddlware";
import { ErrorCommonStrings } from "../../utils/constant";
import { UserRole } from "../../entities/Role/roleEntity";
import {
  LimitedUserData,
  PaginationParams,
  SimplifiedBrand,
} from "../../types";
import { UserDTO } from "../../dtos/userdto";
import { TeamDTO } from "../../dtos/teamdto";
import { HierarchyDTO } from "../../dtos/hirerachydto";
import { BrandDTO } from "../../dtos/brandDto";
import { link } from "fs";
export class AdminService {
  private userRepo = AppDataSource.getRepository(User);
  private roleRepo = AppDataSource.getRepository(Role);
  private teamRepo = AppDataSource.getRepository(Team);
  private brandRepo = AppDataSource.getRepository(Brand);
  private simplifyBrand(brand: Brand): SimplifiedBrand {
    return {
      brandId: brand.brandId,
      brandName: brand.brandName,
      ownerIds: brand.owners.map((owner) => owner.userId),
    };
  }
  async createUser(
    adminUserId: string,
    name: string,
    email: string,
    department: string,
    password: string
  ): Promise<LimitedUserData> {
    try {
      const admin = await this.userRepo.findOne({
        where: { userId: adminUserId },
        relations: ["subordinates"],
      });

      if (!admin) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Admin not found"
        );
      }

      const existingUser = await this.userRepo.findOne({ where: { email } });
      if (existingUser) {
        throw new APIError(
          ErrorCommonStrings.ALREADY_EXIST,
          HttpStatusCode.ALREADY_EXISTS,
          false,
          "User with this email already exists"
        );
      }

      const hashedPassword = await argon2.hash(password);

      const newUser = this.userRepo.create({
        name,
        password: hashedPassword,
        email,
        department,
        manager: admin,
      });

      if (!admin.subordinates) {
        admin.subordinates = [];
      }

      admin.subordinates.push(newUser);

      await AppDataSource.transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.save(newUser);
        await transactionalEntityManager.save(admin);
      });

      return {
        userId: newUser.userId,
        email: newUser.email,
        department: newUser.department,
      };
    } catch (error) {
      logger.error("Error in creating user service", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        "Error creating User"
      );
    }
  }

  async assignRole(userId: string, name: UserRole) {
    try {
      const user = await this.userRepo.findOne({
        where: { userId },
        relations: ["roles", "ownedTeams", "teamsMembers"],
      });
      if (!user) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "User not found"
        );
      }

      let role = await this.roleRepo.findOne({ where: { roleName: name } });
      if (!role) {
        role = this.roleRepo.create({ roleName: name });
        await this.roleRepo.save(role);
      }

      user.roles.push(role);
      const canOwnTeam =
        role.roleName === UserRole.TO || role.roleName === UserRole.PO_TO;

      let team: Team | null = null;
      if (canOwnTeam) {
        team = await this.teamRepo.findOne({
          where: { teamOwner: { userId: user.userId } },
          relations: ["members", "teamOwner"],
        });

        if (!team) {
          team = this.teamRepo.create({
            teamOwner: user,
            members: [user],
          });
        } else {
          team.teamOwner = user;
        }

        user.ownedTeams = user.ownedTeams || [];
        if (
          !user.ownedTeams.some(
            (ownedTeam) => ownedTeam.teamId === team!.teamId
          )
        ) {
          user.ownedTeams.push(team);
        }

        team.members = team.members || [];
        if (!team.members.some((member) => member.userId === user.userId)) {
          team.members.push(user);
        }

        user.teamsMembers = user.teamsMembers || [];
        if (
          !user.teamsMembers.some(
            (memberTeam) => memberTeam.teamId === team!.teamId
          )
        ) {
          user.teamsMembers.push(team);
        }

        await this.teamRepo.save(team);
      }

      await this.userRepo.save(user);

      return {
        user: UserDTO.fromEntity(user),
        team: team ? TeamDTO.fromEntity(team) : null,
      };
    } catch (error) {
      logger.error("Error while assigning role to a User", error);
      if (error instanceof APIError) {
        throw error;
      }

      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        "Error while assigning role to a User"
      );
    }
  }
  async assignBoToTeam(userId: string, teamId: string) {
    const queryRunner = AppDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.userRepo.findOne({
        where: { userId },
        relations: ["roles", "teamsMembers"],
      });

      if (!user) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "User not found"
        );
      }

      const isBO = user.roles.some((role) => role.roleName === UserRole.BO);
      if (!isBO) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "User is not a Business Owner"
        );
      }

      const team = await this.teamRepo.findOne({
        where: { teamId },
        relations: ["members", "teamOwner"],
      });

      if (!team) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Team not found"
        );
      }

      // Ensure user is a member of the team
      if (!team.members.some((member) => member.userId === user.userId)) {
        team.members.push(user);
      }

      // Add team to user's teamsMembers
      user.teamsMembers = user.teamsMembers || [];
      if (
        !user.teamsMembers.some(
          (memberTeam) => memberTeam.teamId === team.teamId
        )
      ) {
        user.teamsMembers.push(team);
      }

      // Set BO's manager to the team owner
      user.manager = team.teamOwner;

      // Add BO as subordinate to team owner
      const teamOwner = await this.userRepo.findOne({
        where: { userId: team.teamOwner.userId },
        relations: ["subordinates"],
      });

      if (teamOwner) {
        teamOwner.subordinates = teamOwner.subordinates || [];
        if (!teamOwner.subordinates.some((sub) => sub.userId === user.userId)) {
          teamOwner.subordinates.push(user);
        }
        await queryRunner.manager.save(teamOwner);
      }

      await queryRunner.manager.save(team);
      await queryRunner.manager.save(user);

      await queryRunner.commitTransaction();

      return {
        user: UserDTO.fromEntity(user),
        team: TeamDTO.fromEntity(team),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      logger.error("Error while assigning BO to team", error);
      if (error instanceof APIError) {
        throw error;
      }

      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        "Error while assigning BO to team"
      );
    } finally {
      await queryRunner.release();
    }
  }

  async createBrand(
    brandName: string,
    revenue: number,
    dealCloseValue: number
  ) {
    try {
      const brand = new Brand();
      brand.brandName = brandName;
      brand.revenue = revenue;
      brand.dealCloseValue = dealCloseValue;

      await this.brandRepo.save(brand);
      return brand;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        "Error creating brand"
      );
    }
  }

  async assignBrandToBo(brandId: string, boId: string) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const brand = await Brand.findOne({
        where: { brandId },
        relations: ["owners"],
      });
      console.log(brand);

      if (!brand) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Brand not found from service"
        );
      }

      const bo = await this.userRepo.findOne({
        where: { userId: boId },
        relations: ["ownerBrands"],
      });

      if (!bo) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "BO not found"
        );
      }

      // Check if the BO is already an owner of the brand
      const isAlreadyOwner = brand.owners.some(
        (owner) => owner.userId === bo.userId
      );

      if (!isAlreadyOwner) {
        brand.owners.push(bo);
        bo.ownerBrands = bo.ownerBrands || [];
        bo.ownerBrands.push(brand);

        await queryRunner.manager.save(brand);
        await queryRunner.manager.save(bo);
      } else {
        // If the BO is already an owner, we don't need to do anything
        await queryRunner.rollbackTransaction();
        return {
          message: "BO is already an owner of this brand",
          brand: this.simplifyBrand(brand),
        };
      }

      await queryRunner.commitTransaction();

      return {
        message: "Brand successfully assigned to BO",
        brand: this.simplifyBrand(brand),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        "Error while assigning brand to BO"
      );
    } finally {
      await queryRunner.release();
    }
  }
  async updateBrand(
    brandId: string,
    brandName: string,
    revenue: number,
    dealCloseValue: number
  ) {
    try {
      const brand = await this.brandRepo.findOne({ where: { brandId } });
      if (!brand) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Brand not found"
        );
      }
      brand.brandName = brandName;
      brand.revenue = revenue;
      brand.dealCloseValue = dealCloseValue;
      await this.brandRepo.save(brand);
      return brand;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        "Error while updating brand"
      );
    }
  }

  async getBrandswithOwners(paginationParams: PaginationParams) {
    try {
      const { page = 1, limit = 10 } = paginationParams;
      const skip = (page - 1) * limit;
      const [brands, total] = await this.brandRepo.findAndCount({
        relations: ["owners", "contactPersons"],
        skip,
        take: limit,
      });
      if (!brands) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Brand not found"
        );
      }
      const brandsDto = brands.map((brand) => BrandDTO.fromEntity(brand));
      return {
        data: brandsDto,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        "Error while getting brand with owners"
      );
    }
  }

  async getHirechry(userId: string, paginationParams: PaginationParams) {
    try {
      const { page = 1, limit = 10 } = paginationParams;
      const skip = (page - 1) * limit;

      const user = await this.userRepo.findOne({
        where: { userId },
        relations: ["subordinates"],
      });
      if (!user) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "User not found"
        );
      }
      const totalSubordinates = user.subordinates.length;
      const paginatedSubordinates = user.subordinates.slice(skip, skip + limit);
      const subordinatesHireacrhies = await Promise.all(
        paginatedSubordinates.map(async (subordinate) => {
          const fullSubordinate = await this.userRepo.findOne({
            where: { userId: subordinate.userId },
            relations: ["subordinates"],
          });
          return HierarchyDTO.fromEntity(fullSubordinate);
        })
      );

      const userHierarchy = HierarchyDTO.fromEntity(user);
      userHierarchy.subordinates = subordinatesHireacrhies;
      return {
        data: [userHierarchy],
        meta: {
          total: totalSubordinates,
          page,
          limit,
          totalPages: Math.ceil(totalSubordinates / limit),
        },
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        "Error while getting Hirechry for the user"
      );
    }
  }

  async updateTeam(teamId: string, teamName: string, teamDescription: string) {
    try {
      const team = await this.teamRepo.findOne({ where: { teamId } });

      if (!team) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Team not found"
        );
      }

      team.teamName = teamName;
      team.teamDescription = teamDescription;
      await this.teamRepo.save(team);
      return team;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        "Error while updating team"
      );
    }
  }

  async updateUser(
    userId: string,
    name: string,
    email: string,
    department: string
  ) {
    try {
      const user = await this.userRepo.findOne({
        where: { userId },
        relations: ["roles"],
      });
      if (!user) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "User not found"
        );
      }
      user.name = name;
      user.email = email;
      user.department = department;
      await this.userRepo.save(user);
      // console.log(user);
      return UserDTO.fromEntity(user);
    } catch (error) {
      logger.error("error while updating the user", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        "Error while updating user"
      );
    }
  }

  async updateUserRole(userId: string, role: string) {}

  async shiftUserToTeam(
    userId: string,
    currentTeamId: string,
    newTeamId: string
  ) {
    try {
      const [user, newTeam] = await Promise.all([
        this.userRepo.findOne({
          where: { userId },
          relations: [
            "roles",
            "teamsMembers",
            "ownerBrands",
            "ownedTeams",
            "manager",
            "subordinates",
          ],
        }),
        this.teamRepo.findOne({
          where: { teamId: newTeamId },
          relations: ["teamOwner", "members"],
        }),
      ]);

      if (!user) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "User not found"
        );
      }
      const role = user.roles.some((r) => r.roleName === "BO");

      if (!role) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "You can only shift BO to different team"
        );
      }

      if (!newTeam) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Team not found"
        );
      }

      // Remove user from current team
      user.teamsMembers = user.teamsMembers.filter(
        (tm: any) => tm.teamId !== currentTeamId
      );
      user.ownedTeams = user.ownedTeams.filter(
        (ot: any) => ot.teamId !== currentTeamId
      );

      // Add user to new team
      user.manager = newTeam.teamOwner;
      newTeam.members.push(user);

      // Update the new team owner's subordinates
      if (newTeam.teamOwner.subordinates) {
        newTeam.teamOwner.subordinates.push(user);
      } else {
        newTeam.teamOwner.subordinates = [user];
      }

      // Save changes
      await Promise.all([
        this.userRepo.save(user),
        this.teamRepo.save(newTeam),
        this.userRepo.save(newTeam.teamOwner),
      ]);

      return UserDTO.fromEntity(user);
    } catch (error) {
      logger.error("error while shifting the team", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        "Error while shifting user to team"
      );
    }
  }
}
