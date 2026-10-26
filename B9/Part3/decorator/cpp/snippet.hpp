#pragma once
struct Policy{virtual bool allow(int)=0;virtual~Policy()=default;};struct PerTransferLimit:Policy{bool allow(int a)override{return a<=1000;}};struct DailyLimit:Policy{Policy& wrapped;int used=0;explicit DailyLimit(Policy& p):wrapped(p){}bool allow(int a)override{if(!wrapped.allow(a)||used+a>1000)return false;used+=a;return true;}};
inline bool demo(){PerTransferLimit base;DailyLimit p{base};return p.allow(600)&&!p.allow(500);}

