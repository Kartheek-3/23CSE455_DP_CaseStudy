// Composite pattern: an abstract TestNode, a TestCase leaf and a TestContainer composite.
#pragma once

#include <memory>
#include <string>
#include <utility>
#include <vector>

// Component, modelled on JUnit's TestDescriptor: containers and tests share this interface.
class TestNode {
public:
    explicit TestNode(std::string name) : name_(std::move(name)) {}
    virtual ~TestNode() = default;
    TestNode(const TestNode&) = delete;
    TestNode& operator=(const TestNode&) = delete;

    const std::string& name() const { return name_; }

    // Number of tests in this subtree (a test counts itself).
    virtual int count_tests() const = 0;
    // True only for a test that carries the tag; containers have no tags.
    virtual bool has_tag(const std::string& tag) const = 0;
    // Removes every test below this node that has the tag, appending its name to `removed`.
    virtual void remove_tests_tagged(const std::string& tag, std::vector<std::string>& removed) = 0;
    // Removes every container below this node that has no tests left, children first.
    virtual void prune_empty(std::vector<std::string>& pruned) = 0;
    // Returns this subtree as indented text.
    virtual std::string render(int depth = 0) const = 0;

private:
    std::string name_;
};

// Leaf: a single test method with optional tags.
class TestCase final : public TestNode {
public:
    TestCase(std::string name, std::vector<std::string> tags);

    int count_tests() const override { return 1; }
    bool has_tag(const std::string& tag) const override;
    void remove_tests_tagged(const std::string&, std::vector<std::string>&) override {}
    void prune_empty(std::vector<std::string>&) override {}
    std::string render(int depth = 0) const override;

private:
    std::vector<std::string> tags_;
};

// Composite: an engine or a test class. It owns its children through unique_ptr,
// so destroying the root frees the whole tree, and a removed child is freed at once.
class TestContainer final : public TestNode {
public:
    TestContainer(std::string kind, std::string name);

    // Takes ownership of the child and returns a non-owning reference to it.
    TestNode& add_child(std::unique_ptr<TestNode> child);

    int count_tests() const override;
    bool has_tag(const std::string&) const override { return false; }
    void remove_tests_tagged(const std::string& tag, std::vector<std::string>& removed) override;
    void prune_empty(std::vector<std::string>& pruned) override;
    std::string render(int depth = 0) const override;

private:
    std::string kind_;
    std::vector<std::unique_ptr<TestNode>> children_;
};
