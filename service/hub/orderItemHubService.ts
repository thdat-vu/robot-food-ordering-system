import * as signalR from "@microsoft/signalr";

export class OrderItemHubService {
  private connection: signalR.HubConnection | null = null;

  async start(baseUrl: string) {
    if (this.connection) return;
  
    const hubUrl = `${baseUrl}orderNotificationHub`;
    console.log("🌐 Connecting to:", hubUrl);
  
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
       
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();
  
    await this.connection.start();
    console.log("✅ Connected to SignalR hub:", hubUrl);
  }
  

  
  onOrderItemUpdated(callback: (data: any) => void) {
    this.connection?.on("ReceiveOrderItemUpdated", (data) => {
      console.log("📦 Received update from hub:", data);
      callback(data);
    });
  }
  

  onOrderItemListUpdated(callback: (list: any[]) => void) {
    this.connection?.on("ReceiveOrderItemListUpdated", (list) => {
      console.log("📦 Received list update from hub:", list);
      callback(list);
    });
  }
  

  stop() {
    this.connection?.stop();
  }
}

export const orderItemHubService = new OrderItemHubService();
