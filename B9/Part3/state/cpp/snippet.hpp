#pragma once
#include <memory>
#include <stdexcept>
struct State {virtual std::unique_ptr<State> next()=0;virtual ~State()=default;};struct Completed;
struct Pending:State{std::unique_ptr<State> next() override;};struct Completed:State{std::unique_ptr<State> next() override{throw std::runtime_error("terminal");}};
inline std::unique_ptr<State> Pending::next(){return std::make_unique<Completed>();} struct Transaction{std::unique_ptr<State> state=std::make_unique<Pending>();void complete(){state=state->next();}};
inline bool demo(){Transaction t;t.complete();try{t.complete();}catch(const std::runtime_error&){return dynamic_cast<Completed*>(t.state.get())!=nullptr;}return false;}

