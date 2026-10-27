
export interface INotificationService {
    sendBookingNotification(driverId: string, data: any): void;
    broadcastBookingNotification(driverIds: string[], data: any): void;
    cancelBookingNotification(driverId:string,data:any):void
    paymentNotification(driverId:string,data:any):void
    bookingAssignedNotification(bookingId: string, driverId?: string): void;
    sendBookingConfirmation(userId: string, data: any): void;
    rejectBookingNotification(userId:string,data:any):void;
    adminChangeDriverStatusNotification(
        driverId: string, 
       data: any
    ): void;


  }
  