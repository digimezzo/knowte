import { MatDialogRef } from '@angular/material/dialog';
import { It, Mock, Times } from 'typemoq';
import { InputDialogComponent } from './input-dialog.component';

describe('InputDialogComponent', () => {
    it.each([false, true])('allows an empty value only when requested (allowEmpty=%s)', (allowEmpty) => {
        const ref = Mock.ofType<MatDialogRef<InputDialogComponent>>();
        const component = new InputDialogComponent({ inputText: '', allowEmpty }, ref.object);

        component.closeDialog();

        ref.verify((x) => x.close(true), allowEmpty ? Times.once() : Times.never());
    });

    it('keeps existing non-empty input behavior', () => {
        const ref = Mock.ofType<MatDialogRef<InputDialogComponent>>();
        const component = new InputDialogComponent({ inputText: 'Notebook' }, ref.object);

        component.closeDialog();

        ref.verify((x) => x.close(It.isValue(true)), Times.once());
    });
});
