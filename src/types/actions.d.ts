interface UserAction {
    id: string;
    type?: string;
    duration?: number;
    handler: string; 
}

type UserActions = UserAction[]

type UserActionsMap = Map<string, UserAction>

type StringifiedUserAction = [string, UserAction]

export type { UserActions, UserAction, UserActionsMap, StringifiedUserAction }