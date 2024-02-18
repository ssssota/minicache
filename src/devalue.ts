import { parse, stringify } from "devalue";

export type DevalueValue =
	| undefined
	| string
	| number
	| boolean
	| null
	| DevalueObject
	| DevalueArray
	| Set<DevalueValue>
	| Map<DevalueValue, DevalueValue>
	| Date
	| RegExp;
export interface DevalueObject extends Record<number | string, DevalueValue> {}
export interface DevalueArray extends Array<DevalueValue> {}

export { parse, stringify };
