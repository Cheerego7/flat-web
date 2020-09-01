import * as React from "react";
import {
    ApplianceNames,
    Cursor,
    CursorAdapter,
    CursorDescription,
    Player,
    Room,
    RoomMember,
    RoomState
} from "white-web-sdk";
import pencilCursor from "./image/pencil-cursor.png";
import selectorCursor from "./image/selector-cursor.png";
import eraserCursor from "./image/eraser-cursor.png";
import shapeCursor from "./image/shape-cursor.svg";
import textCursor from "./image/text-cursor.svg";
import "./index.less";

export type CursorComponentProps = {
    roomMember: RoomMember;
};

class CursorComponent extends React.Component<CursorComponentProps, {}> {
    public constructor(props: CursorComponentProps) {
        super(props);
    }

    public render(): React.ReactNode {
        const {roomMember} = this.props;
        const cursorName = roomMember.payload.cursorName;
        const color = `rgb(${roomMember.memberState.strokeColor[0]}, ${roomMember.memberState.strokeColor[1]}, ${roomMember.memberState.strokeColor[2]})`;
        const appliance = roomMember.memberState.currentApplianceName;
        switch (appliance) {
            case ApplianceNames.pencil: {
                return (
                    <div className="cursor-box">
                        <div className="cursor-pencil-mid">
                            <div style={{opacity: cursorName === undefined ? 0 : 1}} className="cursor-pencil-inner">
                                <span style={{backgroundColor: color}}>{cursorName}</span>
                            </div>
                            <img className="cursor-pencil-image" src={pencilCursor}/>
                        </div>
                    </div>
                );
            }
            case ApplianceNames.selector: {
                return (
                    <div className="cursor-box">
                        <div className="cursor-selector-mid">
                            <img className="cursor-selector-image" src={selectorCursor}/>
                            <div style={{opacity: cursorName === undefined ? 0 : 1}} className="cursor-selector-inner">
                                <span style={{backgroundColor: color}}>{cursorName}</span>
                            </div>
                        </div>
                    </div>
                );
            }
            case ApplianceNames.eraser: {
                return (
                    <div className="cursor-box">
                        <div className="cursor-pencil-mid">
                            <div style={{opacity: cursorName === undefined ? 0 : 1}} className="cursor-pencil-inner">
                                <span style={{backgroundColor: color}}>{cursorName}</span>
                            </div>
                            <img className="cursor-pencil-image" src={eraserCursor}/>
                        </div>
                    </div>
                );
            }
            case ApplianceNames.text: {
                return (
                    <div className="cursor-box">
                        <div className="cursor-text-mid">
                            <div style={{opacity: cursorName === undefined ? 0 : 1}} className="cursor-shape-inner">
                                <span style={{backgroundColor: color}}>{cursorName}</span>
                            </div>
                            <img src={textCursor}/>
                        </div>
                    </div>
                );
            }
            default: {
                return (
                    <div className="cursor-box">
                        <div className="cursor-shape-mid">
                            <div style={{opacity: cursorName === undefined ? 0 : 1}} className="cursor-shape-inner">
                                <span style={{backgroundColor: color}}>{cursorName}</span>
                            </div>
                            <img src={shapeCursor}/>
                        </div>
                    </div>
                );
            }
        }
    }
}

export class CursorTool implements CursorAdapter {
    private readonly cursors: {[memberId: number]: Cursor} = {};
    private roomMembers: ReadonlyArray<RoomMember> = [];
    public createCursor(): CursorDescription {
        return {x: 64, y: 64, width: 128, height: 128};
    }
    public onAddedCursor(cursor: Cursor): void {
        for (const roomMember of this.roomMembers) {
            if (roomMember.memberId === cursor.memberId) {
                cursor.setReactNode((
                    <CursorComponent roomMember={roomMember} />
                ));
                break;
            }
        }
        this.cursors[cursor.memberId] = cursor;
    }
    public onRemovedCursor(cursor: Cursor): void {
        delete this.cursors[cursor.memberId];
    }
    public onMovingCursor(): void {
    }
    public setRoom(room: Room): void {
        this.setColorAndAppliance(room.state.roomMembers);
        room.callbacks.on("onRoomStateChanged", (modifyState: Partial<RoomState>): void => {
            if (modifyState.roomMembers) {
                this.setColorAndAppliance(modifyState.roomMembers);
            }
        });
    }
    public setPlayer(player: Player): void {
        this.setColorAndAppliance(player.state.roomMembers);
        player.callbacks.on("onPlayerStateChanged", (modifyState: Partial<RoomState>): void => {
            if (modifyState.roomMembers) {
                this.setColorAndAppliance(modifyState.roomMembers);
            }
        });
        player.callbacks.on("onLoadFirstFrame", (): void => {
            this.setColorAndAppliance(player.state.roomMembers);
        })
    }
    private setColorAndAppliance(roomMembers: ReadonlyArray<RoomMember>): void {
        this.roomMembers = roomMembers;
        for (const roomMember of roomMembers) {
            const cursor = this.cursors[roomMember.memberId];
            if (cursor) {
                cursor.setReactNode((
                    <CursorComponent roomMember={roomMember} />
                ));
            }
        }
    }
}