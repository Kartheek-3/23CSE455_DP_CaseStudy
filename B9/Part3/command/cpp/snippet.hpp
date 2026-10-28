#pragma once
struct Wallet{int balance;};struct TransferCommand{Wallet& s;Wallet& r;int a;void execute(){s.balance-=a;r.balance+=a;}};
inline bool demo(){Wallet s{20},r{0};TransferCommand{s,r,10}.execute();return s.balance==10&&r.balance==10;}

