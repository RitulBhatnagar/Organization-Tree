export class ContactPersonDTO {
  contactId: string;
  name: string;
  phone: string;
  email: string;

  constructor(contactPerson: any) {
    this.contactId = contactPerson.contactId;
    this.name = contactPerson.name;
    this.phone = contactPerson.phone;
    this.email = contactPerson.email;
  }

  static fromEntity(contactPerson: any): ContactPersonDTO {
    return new ContactPersonDTO({
      contactId: contactPerson.contactId,
      name: contactPerson.name,
      phone: contactPerson.phone,
      email: contactPerson.email,
    });
  }
}
