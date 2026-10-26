#pragma once
#include <memory>
#include <string>
struct Notifier{virtual std::string send()=0;virtual~Notifier()=default;};struct Email:Notifier{std::string send()override{return "email";}};struct Audit:Notifier{std::string send()override{return "audit";}};
struct NotifierFactory{std::unique_ptr<Notifier> create(std::string kind){if(kind=="email")return std::make_unique<Email>();return std::make_unique<Audit>();}};
inline bool demo(){NotifierFactory f;return f.create("email")->send()=="email"&&f.create("audit")->send()=="audit";}

