export interface CommandsConfig {
  /**
   * Style prefix
   * @default 'com-'
   */
  stylePrefix?: string;

  /**
   * Default array of commands
   * @default []
   */
  defaults: any[];

  /**
   * If true, stateful commands (with `run` and `stop` methods) can't be executed multiple times.
   * If the command is already active, running it again will not execute the `run` method.
   * @default true
   */
  strict: boolean;
}

const config: CommandsConfig = {
  stylePrefix: 'com-',
  defaults: [],
  strict: true,
};

export default config;
