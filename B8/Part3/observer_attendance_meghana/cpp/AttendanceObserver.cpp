#include <algorithm>
#include <cassert>
#include <iostream>
#include <string>
#include <vector>
struct AttendanceObserver { virtual ~AttendanceObserver()=default; virtual void update(const std::string&)=0; };
struct AttendanceSubject {
 std::vector<AttendanceObserver*> observers;
 void subscribe(AttendanceObserver* o){observers.push_back(o);}
 void unsubscribe(AttendanceObserver* o){observers.erase(std::remove(observers.begin(),observers.end(),o),observers.end());}
 void markAttendance(const std::string& member){auto event="attendance_marked:"+member; for(auto* o:observers)o->update(event);}
};
struct AttendanceNotification:AttendanceObserver { std::vector<std::string> events; void update(const std::string& e)override{events.push_back(e);} };
int main(){AttendanceSubject s; AttendanceNotification o; s.subscribe(&o); s.markAttendance("Member A"); assert(o.events.size()==1); s.unsubscribe(&o); s.markAttendance("Member B"); assert(o.events.size()==1); std::cout<<"Attendance Observer tests passed\\n";}
