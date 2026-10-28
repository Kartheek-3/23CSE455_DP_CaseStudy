#include "tree_parser.hpp"

#include <fstream>
#include <sstream>

std::unique_ptr<TestContainer> parse(const std::vector<std::string>& lines) {
    std::unique_ptr<TestContainer> root;
    std::vector<TestNode*> path;  // path[d] is the last node seen at depth d (non-owning)

    for (std::size_t i = 0; i < lines.size(); ++i) {
        const int line_number = static_cast<int>(i) + 1;
        const std::string& line = lines[i];
        auto fail = [&](const std::string& message) { throw TreeFormatError(line_number, message); };

        std::istringstream words(line);
        std::vector<std::string> fields;
        for (std::string word; words >> word;) fields.push_back(word);
        if (fields.empty() || fields[0].starts_with('#')) continue;

        const std::size_t indent = line.find_first_not_of(' ');
        if (indent % 2 != 0) fail("indentation must be a multiple of 2 spaces");
        const std::string& kind = fields[0];
        if (kind != "engine" && kind != "class" && kind != "test") fail("unknown kind '" + kind + "'");
        if (fields.size() < 2) fail("missing name");
        const std::string& name = fields[1];
        std::vector<std::string> tags;
        for (std::size_t f = 2; f < fields.size(); ++f) {
            if (!fields[f].starts_with('@') || fields[f].size() == 1) fail("tags must look like @name");
            tags.push_back(fields[f].substr(1));
        }
        if (!tags.empty() && kind != "test") fail("only tests can have tags");

        const std::size_t depth = indent / 2;
        if (!root) {
            if (depth != 0 || kind != "engine") fail("the first node must be an engine at the top level");
            root = std::make_unique<TestContainer>(kind, name);
            path = {root.get()};
            continue;
        }
        if (depth == 0 || kind == "engine") fail("only one engine is allowed, at the top level");
        if (depth > path.size()) fail("indented too far");
        auto* parent = dynamic_cast<TestContainer*>(path[depth - 1]);
        if (parent == nullptr) fail("a test cannot have children");

        std::unique_ptr<TestNode> node;
        if (kind == "test") {
            node = std::make_unique<TestCase>(name, std::move(tags));
        } else {
            node = std::make_unique<TestContainer>(kind, name);
        }
        path.resize(depth);
        path.push_back(&parent->add_child(std::move(node)));
    }
    if (!root) throw TreeFormatError("no engine found");
    return root;
}

std::vector<std::string> read_lines(const std::string& path) {
    std::ifstream in(path);
    if (!in) throw std::runtime_error("cannot open " + path);
    std::vector<std::string> lines;
    for (std::string line; std::getline(in, line);) {
        if (!line.empty() && line.back() == '\r') line.pop_back();
        lines.push_back(line);
    }
    return lines;
}

namespace {

std::string listed(const std::vector<std::string>& names) {
    std::string joined;
    for (const auto& name : names) joined += (joined.empty() ? "" : ", ") + name;
    return "(" + std::to_string(names.size()) + "): " + (names.empty() ? "none" : joined);
}

}  // namespace

std::string report(const std::string& tree_path, const std::string& tag) {
    std::unique_ptr<TestNode> root = parse(read_lines(tree_path));
    std::string out = "== Tree as read ==\n" + root->render();

    const int before = root->count_tests();
    std::vector<std::string> removed;
    std::vector<std::string> pruned;
    root->remove_tests_tagged(tag, removed);
    root->prune_empty(pruned);

    out += "== Remove tests tagged @" + tag + " ==\n";
    out += "tests before: " + std::to_string(before) + "\n";
    out += "removed " + listed(removed) + "\n";
    out += "pruned " + listed(pruned) + "\n";
    out += "tests after: " + std::to_string(root->count_tests()) + "\n";
    return out + "== Tree after ==\n" + root->render();
}
