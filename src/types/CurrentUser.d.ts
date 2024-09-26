type CurrentUser = {
  id: string;
  email: string;
  roleName: string;
  role: [
    {
      id: number;
      name: string;
      displayName: string;
    }
  ];
};
