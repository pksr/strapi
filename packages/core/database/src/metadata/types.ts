import { ForeignKey, Index } from '../schema/types';

export interface ColumnInfo {
  unsigned?: boolean;
  defaultTo?: unknown;
}

export type Attribute = ScalarAttribute | RelationalAttribute;

export type RelationalAttribute =
  | BidirectionalRelationalAttribute
  | MorphRelationalAttribute
  | WayRelation;

export interface BasAttribute {
  type: string;
  columnName?: string;
  default?: any;
  column?: ColumnInfo;
  required?: boolean;
  unique?: boolean;
  component?: string;
  repeatable?: boolean;
  relation?: string;
  columnType?: {
    type: string;
    args: unknown[];
  };
}

export interface ScalarAttribute extends BasAttribute {
  type:
    | 'increments'
    | 'password'
    | 'email'
    | 'string'
    | 'enumeration'
    | 'uid'
    | 'richtext'
    | 'text'
    | 'json'
    | 'integer'
    | 'biginteger'
    | 'float'
    | 'decimal'
    | 'boolean'
    | 'date'
    | 'time'
    | 'datetime'
    | 'timestamp';
}

export interface JoinColumn {
  name: string;
  referencedColumn: string;
  referencedTable?: string;
}

export interface AttributeJoinTable {
  name: string;
  joinColumn: JoinColumn;
  orderBy?: Record<string, 'asc' | 'desc'>;
  on?: Record<string, unknown>;
  orderColumnName?: string;
  inverseOrderColumnName?: string;
  pivotColumns: string[];
  inverseJoinColumn: {
    name: string;
    referencedColumn: string;
  };
}

export interface BidirectionalAttributeJoinTable extends AttributeJoinTable {
  orderColumnName: string;
  inverseOrderColumnName: string;
}

export interface MorphColumn {
  typeField?: string;
  typeColumn: {
    name: string;
  };
  idColumn: {
    name: string;
    referencedColumn: string;
  };
}

export interface MorphJoinTable {
  name: string;
  joinColumn: JoinColumn;
  orderBy?: Record<string, 'asc' | 'desc'>;
  orderColumnName?: string;
  inverseOrderColumnName?: string;
  pivotColumns: string[];
  morphColumn: MorphColumn;
}

export interface BaseRelationalAttribute {
  type: 'relation';
  target: string;
  useJoinTable?: boolean;
  joinTable?: AttributeJoinTable | MorphJoinTable;
  morphBy?: string;
  inversedBy?: string;
  owner?: boolean;
  morphColumn?: MorphColumn;
  joinColumn?: JoinColumn;
  // TODO: remove this
  component?: string;
}

export interface WayRelation extends BaseRelationalAttribute {
  relation: 'oneWay' | 'manyWay';
  target: string;
}

export interface BidirectionalRelationalAttribute extends BaseRelationalAttribute {
  relation: 'oneToOne' | 'oneToMany' | 'manyToOne' | 'manyToMany';
  inversedBy: string;
  joinTable: BidirectionalAttributeJoinTable;
}

export interface MorphRelationalAttribute extends BaseRelationalAttribute {
  relation: 'morphMany' | 'morphOne' | 'morphToOne' | 'morphToMany';
  morphColumn: MorphColumn;
  morphBy: string;
  joinTable: MorphJoinTable;
  target: string;
}

export interface Meta {
  singularName?: string;
  uid: string;
  tableName: string;
  attributes: Record<string, Attribute>;
  indexes: Index[];
  foreignKeys?: ForeignKey[];
  lifecycles?: Record<string, unknown>;
  columnToAttribute?: Record<string, string>;
  componentLink?: Meta;
}

export interface ComponentLinkMeta extends Meta {
  componentLink: Meta;
}

export interface Model {
  uid: string;
  tableName: string;
  singularName: string;
  attributes: Record<string, Attribute>;
  lifecycles: Record<string, unknown>;
  indexes: Index[];
  componentLink?: Meta;
  columnToAttribute?: Record<string, string>;
  foreignKeys?: Record<string, unknown>[];
}

export class Metadata extends Map<string, Meta> {
  get(key: string): Meta {
    if (!super.has(key)) {
      throw new Error(`Metadata for "${key}" not found`);
    }

    return super.get(key) as Meta;
  }

  add(meta: Meta) {
    return this.set(meta.uid, meta);
  }

  /**
   * Validate the DB metadata, throwing an error if a duplicate DB table name is detected
   */
  validate() {
    const seenTables = new Map();
    for (const meta of this.values()) {
      if (seenTables.get(meta.tableName)) {
        throw new Error(
          `DB table "${meta.tableName}" already exists. Change the collectionName of the related content type.`
        );
      }
      seenTables.set(meta.tableName, true);
    }
  }
}
