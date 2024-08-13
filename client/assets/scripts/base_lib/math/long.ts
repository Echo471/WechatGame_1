import { CCClass } from "cc";

export class Long
{
    low: number;
    high: number;
    unsigned: boolean;

    constructor(low: number, high: number, unsigned: boolean)
    {
        this.low = low;
        this.high = high;
        this.unsigned = unsigned;
    }

    ToNumber(): number
    {
        if(this.unsigned)
        {
            return (this.high >>> 0) * 4294967296 + (this.low >>> 0);
        }
        else
        {
            return this.high * 4294967296 + (this.low >>> 0);
        }
    }

    ToString(): string
    {
        return String.fromCharCode(
            this.low & 0xFFFF,
            this.low >>> 16,
            this.high & 0xFFFF,
            this.high >>> 16);
    }

    static FromNumber(value: number): Long
    {
        let low = value >>> 0;
        let high = Math.floor(value / 4294967296);
        return new Long(low, high, value < 0);
    }

    static FromString(value: string): Long
    {
        return new Long(
            value.charCodeAt(0) | (value.charCodeAt(1) << 16),
            value.charCodeAt(2) | (value.charCodeAt(3) << 16),
            false);
    }
}