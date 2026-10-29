#pragma once
#include <memory>
#include <stdexcept>
#include <string>
#include <vector>

struct AdapterError : public std::runtime_error {
    std::string code;
    explicit AdapterError(const std::string& value) : std::runtime_error(value), code(value) {}
};

struct NormalizedOffer {
    std::string providerCode, providerName, offerId, name, kind, address, description;
    long long amountCents;
    std::string currency;
    std::vector<std::string> fields() const;
};

struct OfferProvider {
    virtual ~OfferProvider() = default;
    virtual std::vector<NormalizedOffer> offersFor(const std::string& destination) const = 0;
};

class AtlasAdapter final : public OfferProvider {
    std::string source_;
public:
    explicit AtlasAdapter(std::string source);
    std::vector<NormalizedOffer> offersFor(const std::string& destination) const override;
};

class BeaconAdapter final : public OfferProvider {
    std::string source_;
public:
    explicit BeaconAdapter(std::string source);
    std::vector<NormalizedOffer> offersFor(const std::string& destination) const override;
};

struct ProviderRegistry {
    static std::unique_ptr<OfferProvider> find(const std::string& code,
                                                const std::string& atlasSource,
                                                const std::string& beaconSource);
};

struct BookingOfferClient {
    NormalizedOffer getOffer(const std::string& code, const std::string& destination,
                             const std::string& offerId, const std::string& atlasSource,
                             const std::string& beaconSource) const;
};
