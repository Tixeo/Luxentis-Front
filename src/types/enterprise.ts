export interface Enterprise {
  id: string;
  name: string;
  description: string;
  sector: string;
  employeeCount: number;
  ownerName: string;
  ownerUUID: string; 
  isUserOwner?: boolean;
  createdAt: string;
}


export const mockEnterprises: Enterprise[] = [
  {
    id: "ent-001",
    name: "Entreprise 1",
    description: "Description 1",
    sector: "Extraction minière",
    employeeCount: 12,
    ownerName: "Theodrien",
    ownerUUID: "6a6887fe-dd7c-4f04-98b1-e358ce75c377",
    createdAt: "2023-12-15"
  },
  {
    id: "ent-002",
    name: "Entreprise 2",
    description: "Description 2",
    sector: "Exploitation forestière",
    employeeCount: 8,
    ownerName: "Theodrien",
    ownerUUID: "7b5c9de4-ef12-4a03-9781-c4d91c578e02",
    createdAt: "2023-11-22"
  },
  {
    id: "ent-003",
    name: "Entreprise 3",
    description: "Description 3",
    sector: "Agriculture",
    employeeCount: 15,
    ownerName: "Theodrien",
    ownerUUID: "3a4b7c9d-ef12-4567-89ab-cdef01234567",
    createdAt: "2023-10-05"
  },
  {
    id: "ent-004",
    name: "Entreprise 4",
    description: "Description 4",
    sector: "Technologie",
    employeeCount: 6,
    ownerName: "Theodrien",
    ownerUUID: "2c3d4e5f-6789-abcd-ef01-23456789abcd",
    createdAt: "2024-01-18"
  },
  {
    id: "ent-005",
    name: "Entreprise 5",
    description: "Description 5",
    sector: "Exploration",
    employeeCount: 9,
    ownerName: "Theodrien",
    ownerUUID: "8f9e7d6c-5b4a-3210-fedc-ba9876543210",
    createdAt: "2023-09-30"
  },
  {
    id: "ent-006",
    name: "Entreprise 6",
    description: "Description 6",
    sector: "Enchantement",
    employeeCount: 4,
    ownerName: "TheGuill84",
    ownerUUID: "6a6887fe-dd7c-4f04-98b1-e358ce75c377",
    isUserOwner: true, 
    createdAt: "2024-02-10"
  },
  {
    id: "ent-007",
    name: "Entreprise 7",
    description: "Description 7",
    sector: "Pêche et exploration",
    employeeCount: 7,
    ownerName: "Theodrien",
    ownerUUID: "9f8e7d6c-5b4a-3210-fedc-ba9876543210",
    createdAt: "2023-12-03"
  },
  {
    id: "ent-008",
    name: "Entreprise 8",
    description: "Description 8",
    sector: "Construction",
    employeeCount: 20,
    ownerName: "Theodrien",
    ownerUUID: "5f4e3d2c-1b0a-9876-fedc-ba9876543210",
    createdAt: "2023-08-15"
  },
  {
    id: "ent-009",
    name: "Entreprise 9",
    description: "Description 9",
    sector: "Alchimie",
    employeeCount: 5,
    ownerName: "Theodrien",
    ownerUUID: "1f2e3d4c-5b6a-7890-fedc-ba9876543210",
    createdAt: "2024-01-05"
  },
  {
    id: "ent-010",
    name: "Entreprise 10",
    description: "Description 10",
    sector: "Exploration",
    employeeCount: 6,
    ownerName: "Theodrien",
    ownerUUID: "0a1b2c3d-4e5f-6789-abcd-ef0123456789",
    createdAt: "2023-11-11"
  },
  {
    id: "ent-011",
    name: "Entreprise 11",
    description: "Description 11",
    sector: "Forge",
    employeeCount: 8,
    ownerName: "Theodrien",
    ownerUUID: "7a8b9c0d-1e2f-3456-7890-abcdef123456",
    createdAt: "2023-10-20"
  },
  {
    id: "ent-012",
    name: "Entreprise 12",
    description: "Description 12",
    sector: "Sécurité",
    employeeCount: 12,
    ownerName: "Theodrien",
    ownerUUID: "6f5e4d3c-2b1a-0987-fedc-ba9876543210",
    createdAt: "2024-02-01"
  }
];


export function getEnterprises(
  page: number, 
  limit: number = 4, 
  searchQuery: string = ''
): { 
  data: Enterprise[], 
  totalPages: number,
  currentPage: number,
  totalEntries: number
} {
  
  let filteredEnterprises = [...mockEnterprises];
  
  if (searchQuery) {
    const search = searchQuery.toLowerCase();
    filteredEnterprises = filteredEnterprises.filter(enterprise => 
      enterprise.name.toLowerCase().includes(search) || 
      enterprise.description.toLowerCase().includes(search) ||
      enterprise.sector.toLowerCase().includes(search) ||
      enterprise.ownerName.toLowerCase().includes(search)
    );
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const paginatedEnterprises = filteredEnterprises.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredEnterprises.length / limit);
  
  return {
    data: paginatedEnterprises,
    totalPages,
    currentPage: page,
    totalEntries: filteredEnterprises.length
  };
}


export function getEnterpriseById(id: string): Enterprise | undefined {
  return mockEnterprises.find(enterprise => enterprise.id === id);
}


export function getUserEnterprise(): Enterprise | undefined {
  return mockEnterprises.find(enterprise => enterprise.isUserOwner === true);
}


export function getEnterprisesList(
  page: number, 
  limit: number = 4,
  searchTerm: string = '',
  sector: string = ''
): { 
  enterprises: Enterprise[], 
  totalCount: number
} {
  
  let filteredEnterprises = [...mockEnterprises];
  
  if (searchTerm) {
    const search = searchTerm.toLowerCase();
    filteredEnterprises = filteredEnterprises.filter(enterprise => 
      enterprise.name.toLowerCase().includes(search) || 
      enterprise.description.toLowerCase().includes(search)
    );
  }
  
  if (sector) {
    filteredEnterprises = filteredEnterprises.filter(enterprise => 
      enterprise.sector === sector
    );
  }
  
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedResults = filteredEnterprises.slice(startIndex, endIndex);
  
  return {
    enterprises: paginatedResults,
    totalCount: filteredEnterprises.length
  };
} 