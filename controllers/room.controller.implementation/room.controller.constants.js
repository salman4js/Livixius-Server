var RoomControllerConstants = Object.freeze({
    alreadyOccupied: {
        roomNo: 'Cannot modify/delete occupied room entry!',
        roomType: 'Room type already exists, Cannot modify into this name, Try with different name!'
    },
    alreadyCreated: {
        roomNo: 'Room Number already exists, Cannot create duplicate room number!',
        roomType: 'Room type already exists, Cannot create duplicate room type!'
    }
});

module.exports = RoomControllerConstants;