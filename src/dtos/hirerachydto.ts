export class HierarchyDTO {
  userId: string;
  name: string;
  email: string;
  department: string | null;
  subordinates: HierarchyDTO[];

  constructor(user: any) {
    this.userId = user.userId;
    this.name = user.name;
    this.email = user.email;
    this.department = user.department;
    this.subordinates = user.subordinates
      ? user.subordinates.map((sub: any) => new HierarchyDTO(sub))
      : [];
  }

  static fromEntity(user: any): HierarchyDTO {
    return new HierarchyDTO(user);
  }
}
