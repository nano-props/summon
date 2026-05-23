import type { StateCreator } from 'zustand'
import { summonClient } from '#/renderer/src/data/summon-client.ts'
import type { CommandsSlice, SummonState } from '#/renderer/src/store/types.ts'

export const createCommandsSlice: StateCreator<SummonState, [], [], CommandsSlice> = () => ({
  newTerminal: () => summonClient.newTerminal(),
  hidePanel: () => summonClient.hidePanel(),
})
