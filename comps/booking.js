//when getting all assets from the database the assetBooking showed be inserted as an array in each asset for easy filter
let assetsToShow = allAssets;

assetsToShow = assetsToShow.filter(
  (asset) => asset.assetSection === assetSection
);

console.log("assetsToShow", assetsToShow);
assetsToShow = assetsToShow.filter(
  (asset) =>
    asset.assetBookings.filter((assetBooking) => {
      return !(
        (startDateTime <= assetBooking.startDateTime &&
          endDateTime <= assetBooking.startDateTime) ||
        (startDateTime >= assetBooking.endDateTime &&
          endDateTime >= assetBooking.endDateTime)
      );
    }).length === 0
);
console.log("assetsToShow", assetsToShow);
