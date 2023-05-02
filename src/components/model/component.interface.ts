export default interface Component {
  elementTagIdentifier: Symbol;

  destroy(): void;
}
