import { Toolkit } from "actions-toolkit";
import { Signale } from "signale";

/**
 * Generates an action toolkit, for use in tests.
 *
 * @return {Toolkit} The generated test toolkit.
 */
export function generateToolkit() {
  const tools = new Toolkit({
    logger: new Signale({ disabled: true }),
  });

  return tools;
}
