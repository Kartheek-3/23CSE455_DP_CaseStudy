#include <cassert>
#include <iostream>
#include <string>
struct NotificationService { std::string send(std::string m){return "sent: "+m;} };
struct AttendanceComponent { NotificationService& service; explicit AttendanceComponent(NotificationService& s):service(s){} std::string notifyMember(){return service.send("Attendance marked");} };
int main(){NotificationService s; AttendanceComponent c(s); assert(c.notifyMember()=="sent: Attendance marked"); std::cout<<"Constructor injection test passed\\n";}
