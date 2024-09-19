import Transformer from './models/transformer.interface';

export interface SerializedAnonymousTransformer {
  data: string;
  anonymous: true;
}

export interface SerializedEjectingTransformer {
  source: string;
  data: Array<any>;
}

export type SerializedTransformer =
  | SerializedAnonymousTransformer
  | SerializedEjectingTransformer;

export default class TransformerSerializer {
  private static functionFlag = '!FUNCTION_FLAG!';

  static serialize(transformer: Transformer): SerializedTransformer {
    if ('source' in transformer) {
      return {
        source: transformer.source,
        data: transformer.eject(),
      };
    } else {
      const { functionFlag } = TransformerSerializer;
      const data = JSON.stringify(transformer, (_, value) =>
        typeof value === 'function'
          ? `${functionFlag}${value.toString()}`
          : value
      );

      return {
        data,
        anonymous: true,
      };
    }
  }

  static async deserialize(
    serialized: SerializedTransformer
  ): Promise<Transformer> {
    if ('anonymous' in serialized) {
      const { functionFlag } = TransformerSerializer;

      const functionPattern = new RegExp(`^${functionFlag}`);

      return JSON.parse(serialized.data, (_, value) => {
        if (typeof value === 'string') {
          if (functionPattern.test(value)) {
            const functionContent = value.replace(functionPattern, 'return ');

            const wrapperFunction = new Function(functionContent);

            return wrapperFunction();
          }
        }

        return value;
      });
    } else {
      const { source, data } = serialized;

      const module = await import(source);

      const TransformerClass = module.default;

      return new TransformerClass(...data);
    }
  }
}
