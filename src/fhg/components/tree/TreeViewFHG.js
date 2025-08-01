import React from 'react';
import TreeItemFHG from './TreeItemFHG';

export default function TreeViewFHG({
   defaultExpanded,
   expandAll = false,
   expandLevels,
   ContentComponent,
   EditComponent,
   height,
   width,
   onAdd,
   onEdit,
   onDelete,
   onMove,
   onMoveX,
   confirmRemoveTitleKey,
   confirmRemoveMessageKey,
   onMoveLeft,
   onMoveRight,
   item,
   itemsKey = 'items',
   labelKey = 'label',
   parentKey,
   search,
}) {
   return (
      <TreeItemFHG
         key={'TreeView' + item?.id}
         level={1}
         ContentComponent={ContentComponent}
         height={height}
         width={width}
         defaultExpanded={defaultExpanded}
         expandAll={expandAll}
         expandLevels={expandLevels}
         EditComponent={EditComponent}
         confirmRemoveTitleKey={confirmRemoveTitleKey}
         confirmRemoveMessageKey={confirmRemoveMessageKey}
         item={item}
         itemsKey={itemsKey}
         labelKey={labelKey}
         parentKey={parentKey}
         onMoveX={onMoveX}
         onMove={onMove}
         onMoveLeft={onMoveLeft}
         onMoveRight={onMoveRight}
         onEdit={onEdit}
         onAdd={onAdd}
         onDelete={onDelete}
         search={search}
      />
   );
}
