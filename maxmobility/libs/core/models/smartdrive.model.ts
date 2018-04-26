import { Observable, EventData } from 'tns-core-modules/data/observable';

import { Packet } from '@maxmobility/core';

/**
 * The options object passed to the SmartDrive's performOTA function
 */
export interface SDOTAOptions {
  /**
   * The type of device we want to OTA - can be 'MCU', 'BLE', or 'BOTH'
   */
  deviceType: string;

  /**
   * How long do we want our timeouts (generally on reconnection) to
   * be in seconds?
   */
  timeout: number;

  /**
   * The array of bytes containing the firmware for the MCU
   * (including header)
   */
  mcuFirmware: number[];

  /**
   * The array of bytes containing the firmware for the BLE
   * (including header)
   */
  bleFirmware: number[];
}

export enum SDOTAState {
  not_started,
  awaiting_versions,
  awaiting_mcu_ready,
  updating_mcu,
  awaiting_ble_ready,
  updating_ble,
  rebooting_ble,
  rebooting_mcu,
  verifying_update,
  complete,
  cancelling,
  canceled
}

export class SmartDrive extends Observable {
  // Event names
  public static smartdrive_connect_event = 'smartdrive_connect_event';
  public static smartdrive_disconnect_event = 'smartdrive_disconnect_event';

  public static smartdrive_ble_version_event = 'smartdrive_ble_version_event';
  public static smartdrive_mcu_version_event = 'smartdrive_mcu_version_event';

  public static smartdrive_ota_timeout_event = 'smartdrive_ota_timeout_event';
  public static smartdrive_ota_progress_event = 'smartdrive_ota_progress_event';
  public static smartdrive_ota_version_event = 'smartdrive_ota_version_event';
  public static smartdrive_ota_complete_event = 'smartdrive_ota_complete_event';
  public static smartdrive_ota_failure_event = 'smartdrive_ota_failure_event';

  public events: any /*ISmartDriveEvents*/;

  // public members
  public mcu_version: number = 0xff; // microcontroller firmware version number
  public ble_version: number = 0xff; // bluetooth chip firmware version number
  public battery: number = 0; // battery percent Stat of Charge (SoC)
  public driveDistance: number = 0; // cumulative total distance the smartDrive has driven
  public coastDistance: number = 0; // cumulative total distance the smartDrive has gone

  public address: string = ''; // MAC Address
  public connected: boolean = false;

  // not serialized
  public otaState: SDOTAState = SDOTAState.not_started;

  // private members

  // functions
  constructor(obj?: any) {
    super();
    if (obj !== null && obj !== undefined) {
      this.fromObject(obj);
    }
  }

  public data(): any {
    return {
      mcu_version: this.mcu_version,
      ble_version: this.ble_version,
      battery: this.battery,
      driveDistance: this.driveDistance,
      coastDistance: this.coastDistance,
      address: this.address,
      connected: this.connected
    };
  }

  public fromObject(obj: any): void {
    this.mcu_version = (obj && obj.mcu_version) || 0xff;
    this.ble_version = (obj && obj.ble_version) || 0xff;
    this.battery = (obj && obj.battery) || 0;
    this.driveDistance = (obj && obj.driveDistance) || 0;
    this.coastDistance = (obj && obj.coastDistance) || 0;
    this.address = (obj && obj.address) || '';
    this.connected = (obj && obj.connected) || false;
  }

  // regular methods

  /**
   * Notify events by name and optionally pass data
   */
  public sendEvent(eventName: string, data?: any, msg?: string) {
    this.notify({
      eventName,
      object: this,
      data,
      message: msg
    });
  }

  public performOTA(otaOptions: SDOTAOptions) {
    return new Promise((resolve, reject) => {
      // TODO: handle all the ota process for this specific
      // smartdrive
      /* OTA States
	       not_started,
	       awaiting_versions,
	       awaiting_mcu_ready,
	       updating_mcu,
	       awaiting_ble_ready,
	       updating_ble,
	       rebooting_ble,
	       rebooting_mcu,
	       verifying_update,
	       complete,
	       cancelling,
	       canceled
	    */
      // check state here
      if (this.otaState !== SDOTAState.not_started) {
        console.log(`SD already in inconsistent ota state: ${this.otaState}`);
        console.log('Reboot the SD and then try again!');
        this.otaState = SDOTAState.not_started;
        reject();
      } else {
        // wait for versions (ble (DeviceInfo) and mcu (MotorInfo))
        // send start until we receive ota ready from mcu (involves connect / reconnect)
        // send firmware for mcu
        // send '6' to SD BLE OTA control characteristic
        // wait for ota ready from ble
        // send firmware for ble
        // send '3' to SD BLE OTA control characteristic (involves connect / reconnect)
        // send stopOTA to MCU (involves connect / reconnect)
        // wait for versions (ble (DeviceInfo) and mcu (MotorInfo))
      }
    });
  }

  // handlers

  public handleConnect() {
    // TODO: update state and spawn events
    this.connected = true;
    this.sendEvent(SmartDrive.smartdrive_connect_event);
  }

  public handleDisconnect() {
    // TODO: update state and spawn events
    this.connected = false;
    this.sendEvent(SmartDrive.smartdrive_disconnect_event);
  }

  public handlePacket(p: Packet) {
    const packetType = p.Type();
    const subType = p.SubType();
    if (packetType && packetType == 'Data') {
      switch (subType) {
        case 'DeviceInfo':
          this.handleDeviceInfo(p);
          break;
        case 'MotorInfo':
          this.handleMotorInfo(p);
          break;
        case 'DistanceInfo':
          this.handleDistanceInfo(p);
          break;
        default:
          break;
      }
    }
  }

  // private functions
  private handleDeviceInfo(p: Packet) {
    // This is sent by the SmartDrive Bluetooth Chip when it
    // connects
    const devInfo = p.data('deviceInfo');
    // so they get updated
    /* Device Info
           struct {
           Device     device;     // Which Device is this about?
           uint8_t    version;    // Major.Minor version as the MAJOR and MINOR nibbles of the byte.
           }            deviceInfo;
        */
    this.ble_version = devInfo.version;
    // TODO: send version event (for BLE_VERSION) to subscribers
    this.sendEvent(SmartDrive.smartdrive_ble_version_event, {
      ble: this.ble_version
    });
  }

  private handleMotorInfo(p: Packet) {
    // This is sent by the SmartDrive microcontroller every 200ms
    // (5 hz) while connected
    const motorInfo = p.data('motorInfo');
    /* Motor Info
           struct {
           Motor::State state;
           uint8_t      batteryLevel; // [0,100] integer percent. 
           uint8_t      version;      // Major.Minor version as the MAJOR and MINOR nibbles of the byte.
           uint8_t      padding;
           float        distance;
           float        speed;
           float        driveTime;
           }            motorInfo;
        */
    this.mcu_version = motorInfo.version;
    this.battery = motorInfo.batteryLevel;
    // TODO: send version event (for MCU_VERSION) to subscribers
    this.sendEvent(SmartDrive.smartdrive_mcu_version_event, {
      mcu: this.mcu_version
    });
    // so they get updated about this smartDrive's version
    // TODO: update state (is the motor on or off)
  }

  private handleDistanceInfo(p: Packet) {
    // This is sent by the SmartDrive microcontroller every 1000
    // ms (1 hz) while connected and the motor is off
    const distInfo = p.data('distanceInfo');
    /* Distance Info
           struct {
           uint64_t   motorDistance;  // Cumulative Drive distance in ticks.
           uint64_t   caseDistance;   // Cumulative Case distance in ticks.
           }            distanceInfo;
        */
    this.driveDistance = distInfo.motorDistance;
    this.coastDistance = distInfo.caseDistance;
  }
}

/**
 * All of the events for SmartDrive that can be emitted and listened to.
 */
export interface ISmartDriveEvents {
  smartdrive_disconnect_event: string;
  smartdrive_connect_event: string;

  smartdrive_ble_version_event: string;
  smartdrive_mcu_version_event: string;

  smartdrive_ota_timeout_event: string;
  smartdrive_ota_progress_event: string;
  smartdrive_ota_version_event: string;
  smartdrive_ota_complete_event: string;
  smartdrive_ota_failure_event: string;
}
