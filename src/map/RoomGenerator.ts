import { MapGridManager } from './MapGrid';
import { Room, TileType } from './types';

export class RoomGenerator {
  private map: MapGridManager;
  private maxRooms: number;
  private minRoomSize: number;
  private maxRoomSize: number;

  constructor(
    map: MapGridManager,
    maxRooms: number,
    minRoomSize: number,
    maxRoomSize: number
  ) {
    this.map = map;
    this.maxRooms = maxRooms;
    this.minRoomSize = minRoomSize;
    this.maxRoomSize = maxRoomSize;
  }

  generate(): Room[] {
    const rooms: Room[] = [];
    let roomsCreated = 0;

    for (let i = 0; i < this.maxRooms; i++) {
      const room = this.createRandomRoom();
      
      if (this.isValidRoom(room, rooms)) {
        this.carveRoom(room);
        rooms.push(room);
        roomsCreated++;

        if (roomsCreated > 1) {
          const previousRoom = rooms[roomsCreated - 2];
          this.connectRooms(previousRoom, room);
        }
      }
    }

    return rooms;
  }

  private createRandomRoom(): Room {
    const width = this.randomInt(this.minRoomSize, this.maxRoomSize);
    const height = this.randomInt(this.minRoomSize, this.maxRoomSize);
    const x = this.randomInt(1, this.map.getWidth() - width - 1);
    const y = this.randomInt(1, this.map.getHeight() - height - 1);

    const room: Room = {
      x,
      y,
      width,
      height,
      tiles: []
    };

    for (let ry = y; ry < y + height; ry++) {
      for (let rx = x; rx < x + width; rx++) {
        room.tiles.push({
          type: TileType.FLOOR,
          x: rx,
          y: ry,
          explored: false,
          visible: false
        });
      }
    }

    return room;
  }

  private isValidRoom(room: Room, existingRooms: Room[]): boolean {
    if (room.x < 1 || room.y < 1) {
      return false;
    }

    if (room.x + room.width >= this.map.getWidth() - 1) {
      return false;
    }

    if (room.y + room.height >= this.map.getHeight() - 1) {
      return false;
    }

    for (const existingRoom of existingRooms) {
      if (this.roomsOverlap(room, existingRoom)) {
        return false;
      }
    }

    return true;
  }

  private roomsOverlap(room1: Room, room2: Room): boolean {
    const padding = 1;
    return (
      room1.x <= room2.x + room2.width + padding &&
      room1.x + room1.width + padding >= room2.x &&
      room1.y <= room2.y + room2.height + padding &&
      room1.y + room1.height + padding >= room2.y
    );
  }

  private carveRoom(room: Room): void {
    for (let y = room.y; y < room.y + room.height; y++) {
      for (let x = room.x; x < room.x + room.width; x++) {
        this.map.setTile(x, y, TileType.FLOOR);
      }
    }
  }

  private connectRooms(room1: Room, room2: Room): void {
    const center1 = this.getRoomCenter(room1);
    const center2 = this.getRoomCenter(room2);

    if (Math.random() < 0.5) {
      this.createHorizontalTunnel(center1.x, center2.x, center1.y);
      this.createVerticalTunnel(center1.y, center2.y, center2.x);
    } else {
      this.createVerticalTunnel(center1.y, center2.y, center1.x);
      this.createHorizontalTunnel(center1.x, center2.x, center2.y);
    }
  }

  private getRoomCenter(room: Room): { x: number; y: number } {
    return {
      x: Math.floor(room.x + room.width / 2),
      y: Math.floor(room.y + room.height / 2)
    };
  }

  private createHorizontalTunnel(x1: number, x2: number, y: number): void {
    const startX = Math.min(x1, x2);
    const endX = Math.max(x1, x2);

    for (let x = startX; x <= endX; x++) {
      this.map.setTile(x, y, TileType.FLOOR);
    }
  }

  private createVerticalTunnel(y1: number, y2: number, x: number): void {
    const startY = Math.min(y1, y2);
    const endY = Math.max(y1, y2);

    for (let y = startY; y <= endY; y++) {
      this.map.setTile(x, y, TileType.FLOOR);
    }
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
