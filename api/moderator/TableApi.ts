
export async function fetchTables(params: { 
    pageNumber: number; 
    pageSize: number; 
    searchName?: string; 
    status?: string 
  }): Promise<any> {
    const url = new URL("https://be-robo.zd-dev.xyz/api/Table");
    url.searchParams.append("PageNumber", String(params.pageNumber));
    url.searchParams.append("PageSize", String(params.pageSize));
    if (params.searchName) url.searchParams.append("tableName", params.searchName);
    if (params.status) url.searchParams.append("status", params.status);
  
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Failed to fetch tables");
    return res.json();
  }