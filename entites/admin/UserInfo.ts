interface UserInfo {
    username: string;
    userRole: string;
  }
  interface DecodedToken {
    Id: string;
    Name: string;
    Role: string;
    Email?: string;
    Phone?: string;
    exp?: number;
  }
