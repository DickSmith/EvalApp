import { Packet } from '@maxmobility/core';

/**
 * The options object passed to the SmartDrive's performOTA function
 */
export interface OTAOptions {
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

export class SmartDrive {
  // Event names
  public static disconnect_event = 'disconnect_event';
  public static connect_event = 'disconnect_event';

  public static ble_version_event = 'ble_version_event';
  public static mcu_version_event = 'mcu_version_event';

  public static ota_timeout_event = 'ota_timeout_event';
  public static ota_progress_event = 'ota_progress_event';
  public static ota_version_event = 'ota_version_event';
  public static ota_complete_event = 'ota_complete_event';
  public static ota_failure_event = 'ota_failure_event';

  // public members
  public mcu_version: number = 0xff; // microcontroller firmware version number
  public ble_version: number = 0xff; // bluetooth chip firmware version number
  public battery: number = 0; // battery percent Stat of Charge (SoC)
  public driveDistance: number = 0; // cumulative total distance the smartDrive has driven
  public coastDistance: number = 0; // cumulative total distance the smartDrive has gone

  public address: string = ''; // MAC Address

  // private members

  // functions
  constructor(obj?: any) {
    if (obj !== null && obj !== undefined) {
      this.fromObject(obj);
    }
  }

  public data(): any {
    return {
      mcu_version: this.mcu_version,
      ble_version: this.ble_version,
      battery: this.battery,
      address: this.address
    };
  }

  public fromObject(obj: any): void {
    this.mcu_version = (obj && obj.mcu_version) || 0xff;
    this.ble_version = (obj && obj.ble_version) || 0xff;
    this.battery = (obj && obj.battery) || 0;
    this.address = (obj && obj.address) || '';
  }

  // regular methods

  public performOTA(otaOptions: OTAOptions) {
    // TODO: handle all the ota process for this specific
    // smartdrive
  }

  // handlers

  public handleConnect() {
    // TODO: update state and spawn events
  }

  public handleDisconnect() {
    // TODO: update state and spawn events
  }

  public handlePacket(obj: Packet) {
    // TODO: determine type here and then call the private
    // handlers (which may update state or spawn events)
  }

  // private functions
  private handleDeviceInfo(obj: Packet) {
    // This is sent by the SmartDrive Bluetooth Chip when it
    // connects
    // TODO: send version event (for BLE_VERSION) to subscribers
    // so they get updated
    /* Device Info
	   struct {
	   Device     device;     // Which Device is this about?
	   uint8_t    version;    // Major.Minor version as the MAJOR and MINOR nibbles of the byte.
	   }            deviceInfo;
	*/
  }

  private handleMotorInfo(obj: Packet) {
    // This is sent by the SmartDrive microcontroller every 200ms
    // (5 hz) while connected
    // TODO: send version event (for MCU_VERSION) to subscribers
    // so they get updated about this smartDrive's version
    // TODO: update battery status for the SmartDrive
    // TODO: update state (is the motor on or off)
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
  }

  private handleDistanceInfo(obj: Packet) {
    // This is sent by the SmartDrive microcontroller every 1000
    // ms (1 hz) while connected and the motor is off
    // TODO: update coastDistance
    // TODO: update driveDistance
    /* Distance Info
	   struct {
           uint64_t   motorDistance;  // Cumulative Drive distance in ticks.
           uint64_t   caseDistance;   // Cumulative Case distance in ticks.
	   }            distanceInfo;
	*/
  }
}
