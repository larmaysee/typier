import { IKeyboardLayoutRepository, ISessionRepository } from "../../domain/interfaces/repositories";
import { IEventBus } from "../../domain/interfaces/services";
import { SwitchLayoutCommandDTO } from "../dto/typing-session.dto";

// Domain event for layout switching
export interface LayoutSwitchedEvent {
  id: string;
  type: 'LayoutSwitched';
  aggregateId: string;
  data: {
    sessionId?: string;
    userId?: string;
    previousLayoutId?: string;
    newLayoutId: string;
    timestamp: number;
  };
  timestamp: Date;
  userId?: string;
}

export class SwitchKeyboardLayoutUseCase {
  constructor(
    private layoutRepository: IKeyboardLayoutRepository,
    private sessionRepository: ISessionRepository,
    private eventBus: IEventBus
  ) { }

  async execute(command: SwitchLayoutCommandDTO): Promise<void> {
    const { sessionId, layoutId, userId, previousLayoutId } = command;

    // 1. Validate that the new layout exists
    const newLayout = await this.layoutRepository.getLayoutById(layoutId);
    if (!newLayout) {
      throw new Error(`Keyboard layout not found: ${layoutId}`);
    }

    // 2. Update active session if exists
    if (sessionId) {
      const session = await this.sessionRepository.findById(sessionId);
      if (session) {
        // Validate that the session can accept layout changes
        if (session.status === 'completed') {
          throw new Error('Cannot change layout for completed session');
        }

        // Update the session's active layout
        session.activeLayout = newLayout;
        session.test.keyboardLayoutId = layoutId;
        session.updated_at = new Date();

        await this.sessionRepository.save(session);
      }
    }

    // 3. Save user preference if user is authenticated
    if (userId) {
      await this.layoutRepository.setUserPreferredLayout(
        userId,
        newLayout.language,
        layoutId
      );
    }

    // 4. Publish layout changed event
    const event: LayoutSwitchedEvent = {
      id: this.generateEventId(),
      type: 'LayoutSwitched',
      aggregateId: sessionId || userId || 'anonymous',
      data: {
        sessionId,
        userId,
        previousLayoutId,
        newLayoutId: layoutId,
        timestamp: Date.now()
      },
      timestamp: new Date(),
      userId
    };

    await this.eventBus.publish(event);
  }

  async validateLayoutSwitch(
    sessionId: string,
    newLayoutId: string
  ): Promise<{
    canSwitch: boolean;
    warnings: string[];
    requiresConfirmation: boolean;
  }> {
    const session = await this.sessionRepository.findById(sessionId);
    const newLayout = await this.layoutRepository.getLayoutById(newLayoutId);

    const warnings: string[] = [];
    let canSwitch = true;
    let requiresConfirmation = false;

    if (!session) {
      return {
        canSwitch: false,
        warnings: ['Session not found'],
        requiresConfirmation: false
      };
    }

    if (!newLayout) {
      return {
        canSwitch: false,
        warnings: ['Layout not found'],
        requiresConfirmation: false
      };
    }

    // Check session state
    if (session.status === 'completed') {
      canSwitch = false;
      warnings.push('Cannot change layout for completed session');
    }

    // Check language compatibility
    if (session.test.language !== newLayout.language) {
      canSwitch = false;
      warnings.push(`Layout language (${newLayout.language}) does not match session language (${session.test.language})`);
    }

    // Check if session has significant progress
    const hasSignificantProgress = session.currentInput.length > 10 || session.mistakes.length > 0;
    if (hasSignificantProgress && session.activeLayout.id !== newLayoutId) {
      requiresConfirmation = true;
      warnings.push('Switching layout mid-session may affect your performance statistics');
    }

    // Check competition mode restrictions
    if (session.test.mode === 'competition') {
      // In competition mode, layout switching might be restricted
      const isAllowedCompetitionLayout = await this.isAllowedInCompetition(newLayoutId);
      if (!isAllowedCompetitionLayout) {
        canSwitch = false;
        warnings.push('This layout is not allowed in competition mode');
      } else if (hasSignificantProgress) {
        canSwitch = false;
        warnings.push('Cannot change layout during an active competition session');
      }
    }

    return {
      canSwitch,
      warnings,
      requiresConfirmation
    };
  }

  private async isAllowedInCompetition(layoutId: string): Promise<boolean> {
    // In a real implementation, this would check against competition rules
    // For now, allow standard layouts only
    const layout = await this.layoutRepository.getLayoutById(layoutId);
    return layout ? !layout.isCustom : false;
  }

  private generateEventId(): string {
    return `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}