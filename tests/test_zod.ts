import { fromCpon } from 'libshv-js/cpon';
import { IMap, isIMap, isShvMap, makeIMap, makeMap, makeMetaMap, ShvMap, shvMapType } from 'libshv-js/rpcvalue';
import * as z from '../src/zod.js';

z.map({ ok: z.boolean(), })
	.parse(makeMap({ok: true}))
	.ok;
z.imap({ 1: z.boolean(), })
	.parse(makeIMap({1: true}))[1];

{
	const x = z.metamap({1: z.boolean(), ok: z.boolean()})
		.parse(makeMetaMap({1: true, ok: true}))
	x.ok;
	x[1];
}

const SiteInfoZod = z.recmap(z.map({
    optKey: z.map({
    }).optional(),
}));

const lol = fromCpon(`{"key": {}}`);
SiteInfoZod.parse(lol);
z.rpcvalue().parse(makeIMap({}));

if (z.map({}).parse(makeMap({}))[shvMapType] !== 'map') {
	throw TypeError('z.map didn\'t preserve brand');
}

if (z.imap({}).parse(makeIMap({}))[shvMapType] !== 'imap') {
	throw TypeError('z.imap didn\'t preserve brand');
}

if (z.recmap(z.any()).parse(makeMap({}))[shvMapType] !== 'map') {
	throw TypeError('z.recmap didn\'t preserve brand');
}

if (z.recimap(z.any()).parse(makeIMap({}))[shvMapType] !== 'imap') {
	throw TypeError('z.recimap didn\'t preserve brand');
}

z.imap({asdf: z.number()}).parse(makeIMap({asdf: 123})) satisfies IMap;
z.map({asdf: z.number()}).parse(makeMap({asdf: 123})) satisfies ShvMap;

let some_map = z.map({asdf: z.number()}).parse(makeMap({asdf: 123})) satisfies ShvMap;
if (!isShvMap(some_map)) {
	throw TypeError('z.map didn\'t preserve brand');
}
let some_imap = z.imap({asdf: z.number()}).parse(makeIMap({asdf: 123})) satisfies IMap;
if (!isIMap(some_imap)) {
	throw TypeError('z.imap didn\'t preserve brand');
}
