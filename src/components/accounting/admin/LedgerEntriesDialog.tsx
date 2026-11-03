import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { AccountingBoard } from '../../../interfaces/interfaces';
import { LedgerEntriesPanel } from './LedgerEntriesPanel';

export interface LedgerEntriesDialogProps {
    open: boolean;
    onClose: () => void;
    // Entries in the answer key being edited, which must not be deleted from here.
    protectedEntryIds?: string[];
    // Board of the question being built; the pool shown is locked to it.
    board: AccountingBoard;
}

/**
 * Pool management as a modal, so admins can add, edit, delete or import entries without
 * leaving the question builder. It reuses the Entry Pool tab's panel, so both behave the same.
 */
const LedgerEntriesDialog = ({ open, onClose, protectedEntryIds, board }: LedgerEntriesDialogProps) => (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="max-w-4xl gap-0 p-0">
            <DialogHeader className="shrink-0 border-b border-border p-5 pr-14">
                <DialogTitle>Manage {board} Entry Pool</DialogTitle>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
                {/* Mounted only while open, so the panel loads fresh data each time. */}
                {open && <LedgerEntriesPanel protectedEntryIds={protectedEntryIds} board={board} />}
            </div>
        </DialogContent>
    </Dialog>
);

export { LedgerEntriesDialog };
