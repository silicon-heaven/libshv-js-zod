import {z, type ZodRawShape, type ZodType} from 'zod/v4';
import {Decimal, Double, type MetaMap, type RpcValue, type RpcValueType, RpcValueWithMetaData, shvMapType, UInt} from 'libshv-js/rpcvalue';

export const map = <T extends ZodRawShape>(schema: T) => z.object({...schema, [shvMapType]: z.literal('map')});
export const imap = <T extends ZodRawShape>(schema: T) => z.object({...schema, [shvMapType]: z.literal('imap')});
export const metamap = <T extends ZodRawShape>(schema: T) => z.object({...schema, [shvMapType]: z.literal('metamap')});
export const recmap = <T extends ZodType<RpcValue>>(schema: T) => z.record(z.string(), schema).and(map({}));
export const recimap = <T extends ZodType<RpcValue>>(schema: T) => z.record(z.number(), schema).and(imap({}));

export const uint = () => z.instanceof(UInt<number>);
export const double = () => z.instanceof(Double);
export const decimal = () => z.instanceof(Decimal);
export const blob = () => z.instanceof(ArrayBuffer);
export const list = () => z.array(rpcvalueSchema);

const withMetaInstanceParser = z.instanceof(RpcValueWithMetaData);
const rpcvalueSchema = z.lazy(() => rpcvalue());
export const rpcvalue = (): ZodType<RpcValue> => z.union([
    z.undefined(),
    z.boolean(),
    z.number(),
    uint(),
    double(),
    decimal(),
    blob(),
    z.string(),
    z.date(),
    list(),
    recmap(rpcvalueSchema),
    recimap(rpcvalueSchema),
    withMetaInstanceParser,
]);

export const withMeta = <MetaSchema extends MetaMap, ValueSchema extends RpcValueType>(metaParser: ZodType<MetaSchema>, valueParser: ZodType<ValueSchema>) =>
    z.custom<RpcValueWithMetaData<z.infer<typeof metaParser>, z.infer<typeof valueParser>>>().check(ctx => {
        if (!withMetaInstanceParser.safeParse(ctx.value).success) {
            ctx.issues.push({
                expected: 'map',
                code: 'invalid_type',
                input: ctx.value,
                message: 'Invalid input: expected a value with metadata, got a value with no metadata}',
            });
            return;
        }

        const parsedMeta = metaParser.safeParse(ctx.value.meta);
        if (!parsedMeta.success) {
            ctx.issues = [
                {
                    expected: 'map',
                    code: 'invalid_type',
                    input: ctx.value,
                    message: 'Wrong RpcValueWithMetaData meta',
                },
                ...parsedMeta.error.issues as typeof ctx.issues,
            ];
            return;
        }

        const parsedValue = valueParser.safeParse(ctx.value.value);
        if (!parsedValue.success) {
            ctx.issues = [
                {
                    expected: 'map',
                    code: 'invalid_type',
                    input: ctx.value,
                    message: 'Wrong RpcValueWithMetaData value',
                },
                ...parsedValue.error.issues as typeof ctx.issues,
            ];
        }
    });

export * from 'zod/v4';
